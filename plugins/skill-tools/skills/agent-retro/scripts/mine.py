#!/usr/bin/env python3
"""agent-retro friction miner.

Reads Claude Code session transcripts (~/.claude/projects/*/*.jsonl) and
extracts "friction signals" — the moments where the human<>agent interaction
went wrong or slow. Emits ranked, clustered signals as JSON (default) or a
human-readable summary. Stdlib only.

Signal types:
  tool_rejection   a tool call the user rejected (captures their stated reason)
  retry_loop       the same command re-run repeatedly in one session (>=1 failure)
  risky_git        push/force/reset on main/master/prod (retried or rejected)
  tool_error       a tool call that errored (non-rejection)
  user_correction  a user turn that reads as a course-correction ("no", "don't", ...)
  wasted_search    the same file/path read or grepped many times in one session

Each signal is clustered by (type, key) and ranked by how many sessions it spans
then how often it recurs — recurring cross-session friction is what deserves a
durable config change.
"""
import argparse
import collections
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

HOME = os.path.expanduser("~")
PROJECTS = os.path.join(HOME, ".claude", "projects")

REJECT_MARKERS = ("tool use was rejected", "doesn't want to proceed")
PERMISSION_MARKERS = ("permission", "haven't granted", "hasn't granted", "not allowed")
CORRECTION_RE = re.compile(
    r"^\s*(no+\b|nope|don'?t\b|do not\b|stop\b|wait\b|actually\b|i said\b|"
    r"that'?s (wrong|not)|why did you|you (shouldn'?t|were supposed)|not like that|"
    r"undo\b|revert that|never )",
    re.I,
)
RISKY_GIT_RE = re.compile(r"\bgit\b.*\b(push|reset --hard|push --force|push -f|checkout \.|clean -fd)\b", re.I)
MAIN_BRANCHES = ("main", "master", "prod", "production", "release")


def norm_cmd(cmd):
    """Normalize a bash command to a coarse cluster key: first ~2 meaningful tokens."""
    cmd = cmd.strip().split("\n")[0].split("&&")[0].split("|")[0].strip()
    cmd = re.sub(r"\s+", " ", cmd)
    toks = [t for t in cmd.split(" ") if t and not t.startswith("-")]
    # env-var prefixes / sudo
    while toks and (("=" in toks[0]) or toks[0] in ("sudo", "env", "time")):
        toks.pop(0)
    key = " ".join(toks[:2]) if toks else cmd[:40]
    # collapse git subcommand granularity to "git <sub>"
    return key[:60]


def block_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        out = []
        for b in content:
            if isinstance(b, dict):
                if b.get("type") == "text":
                    out.append(b.get("text", ""))
                elif isinstance(b.get("content"), str):
                    out.append(b["content"])
        return "\n".join(out)
    return ""


def iter_lines(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except (json.JSONDecodeError, ValueError):
                continue


def project_slug_to_label(slug):
    # "-Users-me-Coding-work-acme-my-app" -> "work/acme/my-app"
    parts = slug.strip("-").split("-")
    return "/".join(parts[-3:]) if len(parts) >= 3 else slug


def parse_ts(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def summarize_input(tool, inp):
    if not isinstance(inp, dict):
        return ""
    if tool == "Bash":
        return (inp.get("command") or "").strip().split("\n")[0][:120]
    if tool in ("Edit", "Write", "Read"):
        return os.path.basename(inp.get("file_path", ""))[:80]
    if tool in ("Grep", "Glob"):
        return (inp.get("pattern") or inp.get("query") or "")[:80]
    return json.dumps(inp)[:100]


def mine_file(path, since_dt):
    """Return list of raw event dicts from one transcript."""
    slug = os.path.basename(os.path.dirname(path))
    project = project_slug_to_label(slug)
    session = os.path.splitext(os.path.basename(path))[0]

    events = []
    pending = {}  # tool_use_id -> {tool, input, ts, branch}
    cmd_runs = collections.defaultdict(list)  # norm key -> [ {ts, cmd, error} ]
    search_runs = collections.defaultdict(int)  # path/pattern -> count
    branch = ""
    cwd = ""

    for d in iter_lines(path):
        ts = parse_ts(d.get("timestamp"))
        if since_dt and ts and ts < since_dt:
            continue
        if d.get("gitBranch"):
            branch = d["gitBranch"]
        if d.get("cwd"):
            cwd = d["cwd"]
        if d.get("type") not in ("user", "assistant"):
            continue
        msg = d.get("message") or {}
        content = msg.get("content")
        if not isinstance(content, list):
            # plain-string user turn -> possible correction
            text = content if isinstance(content, str) else ""
            if d.get("type") == "user" and text and CORRECTION_RE.search(text):
                events.append(_ev("user_correction", text.strip().split("\n")[0][:50].lower(),
                                  project, session, branch, ts, text.strip()[:200], cwd))
            continue

        for b in content:
            if not isinstance(b, dict):
                continue
            bt = b.get("type")
            if bt == "text" and d.get("type") == "user":
                t = b.get("text", "")
                if t and CORRECTION_RE.search(t):
                    events.append(_ev("user_correction", t.strip().split("\n")[0][:50].lower(),
                                      project, session, branch, ts, t.strip()[:200], cwd))
            elif bt == "tool_use":
                tool = b.get("name")
                pending[b.get("id")] = {"tool": tool, "input": b.get("input", {}),
                                        "ts": ts, "branch": branch}
                inp = b.get("input", {})
                if tool == "Bash":
                    cmd = (inp.get("command") or "")
                    cmd_runs[norm_cmd(cmd)].append({"cmd": cmd, "ts": ts, "id": b.get("id")})
                elif tool in ("Read", "Grep", "Glob"):
                    k = summarize_input(tool, inp)
                    if k:
                        search_runs[(tool, k)] += 1
            elif bt == "tool_result":
                pid = b.get("tool_use_id") or b.get("id")
                meta = pending.get(pid, {})
                if not b.get("is_error"):
                    continue
                text = block_text(b.get("content"))
                low = text.lower()
                tool = meta.get("tool", "?")
                summ = summarize_input(tool, meta.get("input"))
                if any(m in low for m in REJECT_MARKERS):
                    reason = ""
                    m = re.search(r"the user said:\s*(.*)", text, re.S | re.I)
                    if m:
                        reason = m.group(1).strip()[:200]
                    events.append(_ev("tool_rejection", tool, project, session,
                                      meta.get("branch", branch), meta.get("ts", ts),
                                      f"{tool}({summ}) — reason: {reason or '(none given)'}", cwd))
                elif any(m in low for m in PERMISSION_MARKERS):
                    events.append(_ev("tool_rejection", tool, project, session,
                                      meta.get("branch", branch), meta.get("ts", ts),
                                      f"{tool}({summ}) — permission not granted", cwd))
                else:
                    events.append(_ev("tool_error", f"{tool}:{summ[:30]}", project, session,
                                      meta.get("branch", branch), meta.get("ts", ts),
                                      f"{tool}({summ}) — {text.strip().split(chr(10))[0][:120]}", cwd))
                # mark bash cmd as errored for retry detection
                if tool == "Bash":
                    for runs in cmd_runs.values():
                        for r in runs:
                            if r.get("id") == pid:
                                r["error"] = True

    # retry loops: same normalized command run >=2x in a session with >=1 error
    for key, runs in cmd_runs.items():
        if len(runs) >= 2 and any(r.get("error") for r in runs):
            first = runs[0]
            risky = bool(RISKY_GIT_RE.search(first["cmd"]))
            on_main = branch.split("/")[-1] in MAIN_BRANCHES or "prod" in first["cmd"].lower()
            styp = "risky_git" if (risky and on_main) else "retry_loop"
            events.append(_ev(styp, key, project, session, branch,
                              first.get("ts"),
                              f"`{first['cmd'].splitlines()[0][:90]}` run {len(runs)}x, "
                              f"{sum(1 for r in runs if r.get('error'))} failed", cwd))
        elif RISKY_GIT_RE.search(runs[0]["cmd"]) and (branch.split("/")[-1] in MAIN_BRANCHES):
            events.append(_ev("risky_git", key, project, session, branch, runs[0].get("ts"),
                              f"`{runs[0]['cmd'].splitlines()[0][:90]}` on {branch}", cwd))

    for (tool, k), n in search_runs.items():
        if n >= 4:
            events.append(_ev("wasted_search", f"{tool}:{k}", project, session, branch, None,
                              f"{tool} '{k}' repeated {n}x in one session", cwd))
    return events


def _ev(styp, key, project, session, branch, ts, example, cwd=""):
    return {
        "type": styp,
        "key": key,
        "project": project,
        "session": session,
        "branch": branch or "",
        "cwd": cwd or "",
        "ts": ts.isoformat() if ts else None,
        "example": example,
    }


def repo_root(cwd):
    """Walk up from a session cwd to the repo root that owns the CLAUDE.md to edit.

    Worktrees (e.g. <repo>/.claude/worktrees/<branch>) map back to <repo> so a
    project-scoped rule lands in the canonical checkout, not a throwaway worktree.
    Falls back to the first dir at/above cwd that contains a CLAUDE.md or .git."""
    if not cwd:
        return ""
    marker = os.sep + ".claude" + os.sep + "worktrees" + os.sep
    if marker in cwd:
        return cwd.split(marker, 1)[0]
    d = cwd
    while d and d != os.path.dirname(d):
        if os.path.exists(os.path.join(d, "CLAUDE.md")) or os.path.isdir(os.path.join(d, ".git")):
            return d
        d = os.path.dirname(d)
    return cwd


def cluster(events):
    groups = collections.defaultdict(lambda: {"count": 0, "sessions": set(),
                                              "projects": set(), "branches": set(),
                                              "cwds": collections.Counter(), "examples": []})
    for e in events:
        g = groups[(e["type"], e["key"])]
        g["count"] += 1
        g["sessions"].add(e["session"])
        g["projects"].add(e["project"])
        if e["branch"]:
            g["branches"].add(e["branch"])
        if e.get("cwd"):
            g["cwds"][repo_root(e["cwd"])] += 1
        if len(g["examples"]) < 4:
            g["examples"].append(e["example"])
    out = []
    for (styp, key), g in groups.items():
        repos = g["cwds"].most_common()
        dominant = repos[0][0] if repos else ""
        total_cwd = sum(g["cwds"].values())
        share = (repos[0][1] / total_cwd) if total_cwd else 0.0
        # scope HINT: one repo dominates the friction -> likely project-scoped, else global.
        # This is only a starting guess; DIAGNOSE decides (a universal lesson stays global even
        # if one repo surfaced it most). repo_breakdown gives the spread to reason over.
        scope = "project" if share >= 0.7 else "global"
        has_claude = bool(dominant) and os.path.exists(os.path.join(dominant, "CLAUDE.md"))
        out.append({
            "type": styp,
            "key": key,
            "count": g["count"],
            "session_count": len(g["sessions"]),
            "projects": sorted(g["projects"]),
            "branches": sorted(g["branches"]),
            "scope": scope,
            "dominant_share": round(share, 2),
            "target_repo": dominant,
            "target_has_claude_md": has_claude,
            "repo_breakdown": [{"repo": r, "n": n} for r, n in repos[:5]],
            "examples": g["examples"],
        })
    # rank: cross-session breadth first, then raw recurrence
    out.sort(key=lambda s: (s["session_count"], s["count"]), reverse=True)
    return out


def resolve_targets(args):
    if args.project:
        matches = [d for d in os.listdir(PROJECTS)
                   if args.project.lower() in d.lower()] if os.path.isdir(PROJECTS) else []
        return [os.path.join(PROJECTS, d) for d in matches]
    if not os.path.isdir(PROJECTS):
        return []
    return [os.path.join(PROJECTS, d) for d in os.listdir(PROJECTS)]


def main():
    ap = argparse.ArgumentParser(description="Mine Claude Code transcripts for friction signals.")
    ap.add_argument("--project", help="substring of a project dir slug to limit to (default: all)")
    ap.add_argument("--since", type=int, default=30, help="only sessions from the last N days (default 30, 0 = all)")
    ap.add_argument("--min-sessions", type=int, default=1, help="drop signals seen in fewer than N sessions")
    ap.add_argument("--format", choices=["json", "text"], default="json")
    args = ap.parse_args()

    since_dt = None
    if args.since:
        since_dt = datetime.now(timezone.utc) - timedelta(days=args.since)

    dirs = resolve_targets(args)
    files = []
    for d in dirs:
        if os.path.isdir(d):
            files += [os.path.join(d, f) for f in os.listdir(d) if f.endswith(".jsonl")]

    all_events = []
    for f in files:
        try:
            all_events += mine_file(f, since_dt)
        except (OSError, ValueError):
            continue

    signals = [s for s in cluster(all_events) if s["session_count"] >= args.min_sessions]
    meta = {
        "generated_from": len(files),
        "since_days": args.since or "all",
        "total_events": len(all_events),
        "signal_groups": len(signals),
        "by_type": dict(collections.Counter(e["type"] for e in all_events)),
    }

    if args.format == "json":
        print(json.dumps({"meta": meta, "signals": signals}, indent=2))
        return

    print(f"# agent-retro friction report")
    print(f"scanned {meta['generated_from']} sessions (last {meta['since_days']} days), "
          f"{meta['total_events']} events, {meta['signal_groups']} clusters\n")
    for scope in ("global", "project"):
        bucket = [s for s in signals if s["scope"] == scope]
        if not bucket:
            continue
        print(f"## {scope.upper()} candidates ({len(bucket)})\n")
        for s in bucket:
            tgt = ""
            if scope == "project" and s["target_repo"]:
                flag = "" if s["target_has_claude_md"] else "  [no CLAUDE.md yet]"
                tgt = f"  → {os.path.basename(s['target_repo'].rstrip(os.sep))}{flag}"
            print(f"[{s['type']}] {s['key']}  —  {s['count']}x across {s['session_count']} session(s)"
                  f"{tgt}")
            for ex in s["examples"][:3]:
                print(f"    · {ex}")
            print()


if __name__ == "__main__":
    main()
