# Signal taxonomy

What each signal type from `mine.py` means, the root cause it usually points to, and the kind
of hardening that fixes it. Read this before diagnosing.

| Type              | What it detects                                                               | Usual root cause                                          | Typical fix                                                |
| ----------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| `tool_rejection`  | A tool call the user rejected. The user's stated reason is captured verbatim. | Agent did something the user repeatedly doesn't want.     | A "never do X / always do Y" rule; sometimes a hook.       |
| `retry_loop`      | Same normalized command run ≥2× in one session with ≥1 failure.               | Missing precondition, wrong flags, or a flaky invocation. | A rule encoding the working invocation, or a helper/alias. |
| `risky_git`       | push / force-push / hard-reset / clean on `main`/`master`/`prod`.             | Branch-first guardrail missing or too weak.               | A pre-push/pre-commit **hook** > prose; branch-first rule. |
| `tool_error`      | A tool call that errored (not a rejection).                                   | Broad — triage by the error text in `examples`.           | Depends; often a rule about environment/paths.             |
| `user_correction` | A user turn that reads as a course-correction ("no", "don't", "I said", …).   | A recurring expectation the agent keeps missing.          | Promote the correction into a durable rule.                |
| `wasted_search`   | Same file read / same pattern grepped ≥4× in one session.                     | The agent doesn't know where things live.                 | An ARCHITECTURE pointer or a memory, **not** a rule.       |

## Reading the signal

- **`session_count` beats `count`.** A thing that happened 30× in one session is one bad session;
  a thing that happened once in each of 12 sessions is a systemic gap. The miner ranks by
  breadth first for this reason.
- **`branches`** tells you scope. All `main`? Likely a global-workflow issue. All within one
  repo's ticket branches? A project rule.
- **`scope` / `dominant_share` / `target_repo` / `repo_breakdown`** drive global-vs-project
  routing. `scope` is a _hint_ from how concentrated the friction is in one repo
  (`dominant_share` ≥ 0.7 → `"project"`), with `target_repo` the resolved repo root to edit
  (worktrees mapped back to the canonical checkout) and `repo_breakdown` the full spread.
  **Override the hint with judgement:** a _universal_ lesson stays global even if one repo
  surfaced it most (bare `cd` is a shell truth, not one repo's rule), while repo-specific _tooling or
  workflow_ (a repo's own `board.py` / `$BOARD_DOCS`, its test command) belongs in that
  repo's `CLAUDE.md` even at lower share. `target_has_claude_md` says whether that file exists yet.
- **`projects`** is the older label-based spread — noisy when one product spans many sub-repos
  (a product's many `product-*` repos), so prefer `repo_breakdown` for routing.
- **Rejection reasons are the highest-value text in the whole report** — they're the user saying,
  in their own words, what they wanted instead. Quote them in the proposal.

## Known false positives to discard

- **Coarse command keys.** `mine.py` normalizes a bash command to its first ~2 tokens, so a
  `retry_loop` on `cd /Users/...` with "run 74×" is usually the agent re-establishing cwd across
  many unrelated calls, not a failing loop — check whether failures actually dominate before
  proposing.
- **`echo`/diagnostic scaffolding** clustering together — inspect the examples; if they're
  distinct one-off probes, skip.
- **Errors the environment causes** (network, an external service down) — no config change fixes
  those; note and drop.
