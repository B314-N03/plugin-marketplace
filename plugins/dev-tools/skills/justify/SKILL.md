---
name: justify
description: Generates or extends a project's justfile with one-command orchestration recipes from a prompt — dev stacks, docker infra, and multi-pane terminal workflows such as a 4-pane Claude Code grid. Use when the user says "justify", "make a just command", "add a just recipe", "one command to start this project", "justfile", or wants a single command that boots everything a project needs.
argument-hint: "[what the command should start, e.g. 'the whole dev stack' or '4-pane claude grid in the cc repo']"
---

# Justify

Turn a prompt like *"one command that boots the whole stack"* or *"open Claude in a 4-grid split in the cc repo"* into a real, working `just` recipe committed to the project's justfile.

Two recipe families, often combined in one justfile:

- **Stack recipes** — detached docker infra + long-running dev servers, with a matching `down` that stops exactly what was started.
- **Workflow recipes** — a terminal laid out for a task: an agent grid (N panes each running `claude`), a review layout, a log wall.

## Instructions

### Step 1 — Read the request and the project

Run these in parallel before proposing anything:

- `just --list` and read the existing justfile if one exists (`justfile`, `.justfile`, `Justfile`).
- Find the moving parts: `package.json` scripts, `docker-compose.yml` / `compose.yaml` (and its profiles), `Makefile`, `gradlew`, `mvnw`, `Cargo.toml`, `pyproject.toml`, `Procfile`.
- Find the ports: `vite.config.*`, `.env*` (via the env-inspect helper — never read `.env` directly), `application*.yml`, compose port mappings.
- Note sibling repos the request implies. Repos outside the project root get an absolute-path variable at the top of the justfile.

Never invent a script, port, or service name. Every command in a generated recipe must trace back to something found in this step.

### Step 2 — Confirm the shape

State back, in under 10 lines: the recipe names, what each pane will run, the ports, and anything that needs an absolute path. Ask only about what discovery could not settle — a missing sibling-repo path, or which of two plausible dev scripts to use. Then proceed.

### Step 3 — Detect the terminal driver

Pick one, in this order, and say which was picked:

1. `$TERM_PROGRAM` is `iTerm.app` → **iTerm2 AppleScript** (default; richest layout control).
2. `$TMUX` set or `tmux` on PATH → **tmux**.
3. Ghostty version 1.3.0 or newer (`ghostty --version`) → Ghostty AppleScript.
4. None of the above → **background + log files**, one `tail -f` per service, no panes.

Layout snippets for each driver are in [reference/terminal-layouts.md](reference/terminal-layouts.md). Read it before writing any pane-splitting recipe — split ordering is the single most common source of a wrong layout.

### Step 4 — Write the recipes

Read [reference/justfile-patterns.md](reference/justfile-patterns.md) for `just` syntax that is easy to get wrong (brace escaping, shebang recipes, attributes, path joining).

Rules that always apply:

- **Merge, never clobber.** An existing justfile is edited in place; existing recipes stay untouched unless the user asked to change them.
- **Every launcher gets a stopper.** A recipe that starts background work ships with a `down` that stops it by tracked PID. See [reference/lifecycle.md](reference/lifecycle.md).
- **Every recipe gets a one-line doc comment** — just takes only the last line of the comment block as the `just --list` text. Group related recipes with `[group('name')]`.
- **Composite plus atomic.** Alongside `up`, expose each service as its own foreground recipe (`just frontend`) so one piece can be restarted alone.
- **Paths via `justfile_directory()`** and the `/` join operator, so the justfile works from any subdirectory.

Use [templates/devstack-justfile.md](templates/devstack-justfile.md) as the skeleton.

### Step 5 — Verify before reporting

Non-negotiable, in order:

```bash
just --summary                   # parses at all; exits 1 with file:line on a syntax error
just --list                      # every recipe shows the description you intended
just -n <new-recipe>             # dry-run: prints the expanded commands, runs nothing
```

Read the `just --list` output rather than assuming it: just derives a recipe's description from
only the **last** line of its comment block, so a two-line comment silently lists the wrong half.

`just -n` is the real test — it expands every variable and shows the exact AppleScript or shell that would run, without starting anything. Read that output and check the paths and pane order actually make sense. If a recipe takes arguments, dry-run it with realistic ones.

Only offer to actually run the recipe after these pass. Launching a stack or spawning agent panes is the user's call — ask, do not just run it.

### Step 6 — Wire up the surroundings

- Add the PID/log state directory to `.gitignore`.
- If the project has a CLAUDE.md, add a line pointing at the new entry command.

## Failure Handling

| Failure | Action |
|---------|--------|
| `just` not installed | Stop; tell the user `brew install just`. Do not generate a Makefile instead. |
| No justfile exists | Create one, starting with a `default: @just --list` recipe. |
| Recipe name already taken | Do not overwrite. Show the existing recipe and ask: replace, or pick a new name. |
| `just --summary` fails | Read the reported file:line, fix it, re-run. Never report a justfile that does not parse. |
| Sibling repo path unknown | Ask once. Do not guess a path under the project root. |
| Terminal driver unavailable | Fall back one step down the Step 3 list and say so in the report. |
| Ghostty older than 1.3.0 | AppleScript is unavailable — fall back to background + logs. |

## Output Format

Report using [templates/output-report.md](templates/output-report.md).

## Notes

- The generated justfile is documentation as much as automation — a person reading `just --list` should understand the project's entry points without opening anything else.
- Prefer extending an existing recipe over adding a near-duplicate one.
- Agent-grid recipes launch real Claude Code sessions that consume tokens. Give them a `[confirm]` attribute when the pane count is above two.
