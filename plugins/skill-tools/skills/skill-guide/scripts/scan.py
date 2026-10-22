"""Scan personal, project and plugin skills; print a grouped skill index.

Usage: scan.py [keyword]   (no keyword = everything; `groups` = counts only)
Groups are detected, never configured: a plugin's skills form a group named
after the plugin, and the plugin's marketplace is the suite that holds it.
Loose skills group as `personal` (~/.claude/skills) and `project`
(.claude/skills under the working directory). A keyword naming a group or a
suite prints it; anything else is a case-insensitive search over names and
descriptions.
"""
import json
import re
import sys
from pathlib import Path

HOME = Path.home() / ".claude"

def parse(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    meta, body = {}, text
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if m:
        body = m.group(2)
        key = None
        for line in m.group(1).splitlines():
            kv = re.match(r"^([A-Za-z_-]+):\s*(.*)$", line)
            if kv:
                key, val = kv.group(1), kv.group(2).strip()
                meta[key] = "" if val in (">", "|", ">-", "|-") else val.strip("\"'")
            elif key and line.startswith(" "):
                meta[key] = (meta[key] + " " + line.strip()).strip()
    if not meta.get("description"):
        first = next((l.strip() for l in body.splitlines()
                      if l.strip() and not l.startswith("#")), "")
        meta["description"] = first
    return meta, body


def entry(path, name, plugin, group, suite, kind):
    meta, body = parse(path)
    invoke = f"/{plugin}:{name}" if plugin else f"/{name}"
    return {
        "name": name, "invoke": invoke, "group": group, "suite": suite, "kind": kind,
        "source": f"plugin {plugin}" if plugin else group,
        "hidden": meta.get("user-invocable", "").lower() == "false",
        "hint": meta.get("argument-hint", ""),
        "description": meta.get("description", ""),
        "when": meta.get("when_to_use", ""),
        "_body": body,
    }


def loose_skills(root, group):
    return [entry(skill, skill.parent.name, None, group, group, "skill")
            for skill in sorted(root.glob("*/SKILL.md"))]


def collect():
    items = loose_skills(HOME / "skills", "personal")
    project = Path.cwd() / ".claude" / "skills"
    if project.resolve() != (HOME / "skills").resolve():
        items += loose_skills(project, "project")
    installed = json.loads((HOME / "plugins" / "installed_plugins.json").read_text())
    for key, installs in sorted(installed.get("plugins", {}).items()):
        plugin, _, marketplace = key.partition("@")
        root = Path(installs[0]["installPath"])
        for skill in sorted(root.glob("skills/*/SKILL.md")):
            items.append(entry(skill, skill.parent.name, plugin, plugin, marketplace or plugin, "skill"))
        for cmd in sorted(root.glob("commands/*.md")):
            items.append(entry(cmd, cmd.stem, plugin, plugin, marketplace or plugin, "command"))
    link_references(items)
    return items


def link_references(items):
    for item in items:
        refs = set()
        for other in items:
            if other["name"] == item["name"]:
                continue
            # Single-word names ("plan", "pr") only count in namespaced form.
            needle = other["name"] if "-" in other["name"] else other["invoke"].lstrip("/")
            if ":" not in needle and "-" not in needle:
                continue
            if re.search(rf"(?<![\w-]){re.escape(needle)}(?![\w-])", item["_body"]):
                refs.add(other["invoke"] if ":" in needle else other["name"])
        item["links"] = sorted(refs)
    seen = {}
    for item in items:
        seen.setdefault(item["name"], []).append(item["invoke"])
    for item in items:
        twins = [i for i in seen[item["name"]] if i != item["invoke"]]
        item["duplicate_of"] = twins
        del item["_body"]


def main():
    items = collect()
    arg = (sys.argv[1] if len(sys.argv) > 1 else "").strip().lower()
    groups = sorted({i["group"] for i in items})
    suites = sorted({i["suite"] for i in items})
    if arg == "groups":
        for suite in suites:
            members = sorted({i["group"] for i in items if i["suite"] == suite})
            counts = ", ".join(f"{g} {sum(1 for i in items if i['group'] == g)}" for g in members)
            print(f"{suite}: {counts}")
        return
    if arg in groups:
        items = [i for i in items if i["group"] == arg]
    elif arg in suites:
        items = [i for i in items if i["suite"] == arg]
    elif arg:
        items = [i for i in items if arg in (i["name"] + " " + i["invoke"] + " "
                                             + i["description"] + " " + i["when"]).lower()]
    print(f"suites: {', '.join(suites)} | groups: {len(groups)} | matched: {len(items)}")
    current = None
    for i in sorted(items, key=lambda i: (i["suite"], i["group"], i["name"])):
        heading = i["group"] if i["group"] == i["suite"] else f"{i['suite']} / {i['group']}"
        if heading != current:
            current = heading
            print(f"\n## {current}")
        flags = [i["kind"]] + (["internal"] if i["hidden"] else [])
        print(f"- {i['invoke']} {i['hint']}".rstrip() + f"  [{', '.join(flags)}; {i['source']}]")
        print(f"  what: {shorten(i['description'])}")
        if i["when"]:
            print(f"  when: {shorten(i['when'])}")
        if i["links"]:
            print(f"  links: {', '.join(i['links'])}")
        if i["duplicate_of"]:
            print(f"  also installed as: {', '.join(i['duplicate_of'])}")


def shorten(text, limit=240):
    text = " ".join(text.split())
    return text if len(text) <= limit else text[:limit].rsplit(" ", 1)[0] + " …"


if __name__ == "__main__":
    main()
