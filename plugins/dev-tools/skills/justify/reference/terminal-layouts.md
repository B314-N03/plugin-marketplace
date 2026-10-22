# Terminal Layouts

Pane-splitting recipes per terminal driver, plus the Claude Code agent-grid pattern.

## Table of Contents

- Driver Selection
- iTerm2 (default)
- iTerm2 Grid Geometries
- tmux
- Ghostty
- Background + Logs (no-pane fallback)
- Claude Code Agent Grids

## Driver Selection

| Condition | Driver |
|-----------|--------|
| `$TERM_PROGRAM` is `iTerm.app` | iTerm2 AppleScript |
| `$TMUX` set, or `tmux` on PATH | tmux |
| `ghostty --version` reports 1.3.0 or newer | Ghostty AppleScript |
| otherwise | background + logs |

Guard AppleScript recipes with `[macos]` so they fail loudly on other platforms.

## iTerm2 (default)

Object model: `application` owns `windows`, a window owns `tabs`, a tab owns `sessions`. A split pane **is** a session.

Two commands do the work, and their names are the opposite of tmux:

| Command | Creates a pane |
|---------|----------------|
| `split vertically with default profile` | to the **right** |
| `split horizontally with default profile` | **below** |

Both are sent to a session and **return the newly created session**.

### The rule that prevents wrong layouts

Capture every split result into a variable immediately, and always split *a named variable*, never `current session`. After any split the "current" session changes, so a script that relies on it produces a staircase instead of a grid.

```applescript
set rightTop to (split vertically with default profile)   -- correct: captured
split vertically with default profile                     -- wrong: result lost
```

### Preferred recipe form: heredoc, not `-e` chains

A shebang recipe with a quoted heredoc avoids nested-quote escaping entirely. `just` still interpolates `{{variables}}` inside the heredoc, because it renders the script before running it.

```just
# Boot the stack in one iTerm tab, one pane per server.
[macos]
[group('stack')]
up: infra
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p "{{state_dir}}"
    osascript <<'APPLESCRIPT'
    tell application "iTerm2"
      tell current window
        set newTab to (create tab with default profile)
        set topLeft to (current session of newTab)
        tell topLeft
          set name to "backend"
          write text "printf '\\033]0;backend\\007'; echo $$ > \"{{state_dir}}/backend.pid\"; cd \"{{backend_dir}}\" && npm run dev"
          set topRight to (split vertically with default profile)
          set bottomLeft to (split horizontally with default profile)
        end tell
        tell topRight
          set name to "frontend"
          write text "printf '\\033]0;frontend\\007'; echo $$ > \"{{state_dir}}/frontend.pid\"; cd \"{{frontend_dir}}\" && npm run dev"
        end tell
        tell bottomLeft
          set name to "tests"
          write text "printf '\\033]0;tests\\007'; cd \"{{justfile_directory()}}\" && npm run test:watch"
        end tell
      end tell
    end tell
    APPLESCRIPT
```

`write text` types the line and presses return, so the pane stays an ordinary interactive shell — Ctrl+C then Up-arrow restarts the server. That is why it beats `nohup`.

### Pane titles need both halves

`set name` alone does not stick. The shell emits its own title escape at the first prompt and
overwrites it — a freshly split pane ends up reading `-zsh` instead of the label. Set the title
from inside the pane command as well, immediately before the long-running process starts:

```
write text "printf '\\033]0;backend\\007'; cd \"{{backend_dir}}\" && npm run dev"
```

That title survives because a foreground server never returns to a prompt. Keep `set name` too:
it is what AppleScript queries and iTerm's pane switcher read. Label every pane — four unlabeled
panes are unusable.

### Escaping cheat sheet

| Context | Rule |
|---------|------|
| Literal `{` `}` in a non-shebang recipe | double them: `{{{{.Names}}` |
| Double quotes inside `write text "..."` | escape as `\"` |
| `$` in a shebang recipe | passed through to bash unchanged |
| `{{var}}` inside a quoted heredoc | still interpolated by just |

## iTerm2 Grid Geometries

Each block assumes `set a to (current session of newTab)`.

**2 panes, side by side**
```
tell a: set b to (split vertically with default profile)
```

**2 panes, stacked**
```
tell a: set b to (split horizontally with default profile)
```

**3 panes — one left, two right**
```
tell a: set b to (split vertically with default profile)
tell b: set c to (split horizontally with default profile)
```

**4 panes — even 2x2 grid**
```
tell a: set b to (split vertically with default profile)     -- b = top right
tell a: set c to (split horizontally with default profile)   -- c = bottom left
tell b: set d to (split horizontally with default profile)   -- d = bottom right
```
Order matters: split the top row into columns first, then split each column. Splitting `a` twice in a row before touching `b` gives an uneven layout.

**5 panes — three left, two right**
```
tell a: set d to (split vertically with default profile)     -- d = right top
tell a: set b to (split horizontally with default profile)
tell b: set c to (split horizontally with default profile)
tell d: set e to (split horizontally with default profile)
```

**6 panes — even 3x2**: build the 2x2 above, then split `c` and `d` horizontally once more.

Beyond six panes, panes get too short to read a stack trace. Use a second tab instead.

## tmux

Naming is inverted relative to iTerm2: `-h` splits into **side-by-side** columns, `-v` into stacked rows.

```just
# Boot the stack in a tmux session named after the project.
[group('stack')]
up:
    #!/usr/bin/env bash
    set -euo pipefail
    S={{session}}
    tmux has-session -t "$S" 2>/dev/null && { tmux attach -t "$S"; exit 0; }
    tmux new-session  -d -s "$S" -n dev -c "{{backend_dir}}"  'npm run dev'
    tmux split-window -h -t "$S:dev"    -c "{{frontend_dir}}" 'npm run dev'
    tmux split-window -v -t "$S:dev"    -c "{{justfile_directory()}}" 'npm run test:watch'
    tmux select-layout -t "$S:dev" tiled
    tmux attach -t "$S"
```

`select-layout tiled` produces an even grid without hand-computing sizes — prefer it over manual splits for four or more panes. Teardown is one line: `tmux kill-session -t {{session}}`, which makes the PID tracking in [lifecycle.md](lifecycle.md) unnecessary for tmux-driven recipes.

Re-running `up` attaches to the existing session instead of creating a duplicate.

## Ghostty

Requires **1.3.0 or newer**; earlier versions expose no AppleScript dictionary and must fall back to background + logs. Check with `ghostty --version` before generating, and verify command spelling against the app's own dictionary (open Script Editor, File, Open Dictionary, Ghostty) since the vocabulary is newer and less settled than iTerm2's.

Shape:

```applescript
tell application "Ghostty"
  set t to focused terminal of selected tab of front window
  input text "cd /path && npm run dev" to t
  send key "enter" to t
  split t direction right
end tell
```

Objects are `windows`, `tabs`, `terminals`; `split` takes `right`, `left`, `up`, `down`. Unlike iTerm2 there is no documented way to set a pane title, so put the service name in the command itself, for example by exporting a prompt variable.

## Background + Logs (no-pane fallback)

```just
# Start every server detached, logging to {{state_dir}}.
[group('stack')]
up: infra
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p "{{state_dir}}"
    start() {
      local name="$1" dir="$2"; shift 2
      ( cd "$dir" && nohup "$@" > "{{state_dir}}/$name.log" 2>&1 & echo $! > "{{state_dir}}/$name.pid" )
      echo "started $name (pid $(cat "{{state_dir}}/$name.pid"))"
    }
    start backend  "{{backend_dir}}"  npm run dev
    start frontend "{{frontend_dir}}" npm run dev
    echo "logs: just logs <name>"
```

Pair it with a `logs` recipe: `tail -f "{{state_dir}}/{{name}}.log"`.

## Claude Code Agent Grids

A workflow recipe that opens N panes each running an interactive `claude`.

Relevant CLI surface:

| Flag | Use |
|------|-----|
| `claude "prompt"` | starts interactive with that opening prompt |
| `--add-dir <dir>` | grant tool access to a sibling repo |
| `-c` / `--continue` | resume that directory's most recent conversation |
| `--agent <name>` | pin the pane to a specific agent |
| `--permission-mode plan` | open a read-only planning pane |

Two variants — pick based on whether the panes will edit the same files:

**Same checkout** (read-heavy work: review, exploration, planning). Simple, but concurrent edits from two panes will collide.

```just
# Open a 2x2 Claude grid in the repo — pane 1 plans, panes 2-4 take a focus area.
[macos]
[confirm('Spawn 4 Claude sessions?')]
[group('workflow')]
grid repo=justfile_directory():
    #!/usr/bin/env bash
    set -euo pipefail
    osascript <<'APPLESCRIPT'
    tell application "iTerm2"
      tell current window
        set t to (create tab with default profile)
        set a to (current session of t)
        tell a
          set name to "plan"
          write text "printf '\\033]0;plan\\007'; cd \"{{repo}}\" && claude --permission-mode plan"
          set b to (split vertically with default profile)
          set c to (split horizontally with default profile)
        end tell
        tell b
          set name to "impl"
          write text "printf '\\033]0;impl\\007'; cd \"{{repo}}\" && claude"
          set d to (split horizontally with default profile)
        end tell
        tell c
          set name to "tests"
          write text "printf '\\033]0;tests\\007'; cd \"{{repo}}\" && claude"
        end tell
        tell d
          set name to "review"
          write text "printf '\\033]0;review\\007'; cd \"{{repo}}\" && claude"
        end tell
      end tell
    end tell
    APPLESCRIPT
```

**Isolated worktrees** (parallel implementation). Each pane gets its own branch and working copy, so agents cannot overwrite each other. Create the worktrees in the recipe, and put them in a sibling directory — never nested inside the repo.

```just
worktrees := justfile_directory() / "-worktrees"

# Open one Claude pane per agent, each in its own git worktree and branch.
[macos]
[confirm]
[group('workflow')]
agents count="4":
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p "{{worktrees}}"
    for i in $(seq 1 {{count}}); do
      wt="{{worktrees}}/agent-$i"
      [ -d "$wt" ] || git -C "{{justfile_directory()}}" worktree add -b "agent-$i" "$wt"
    done
    echo "worktrees ready; splitting panes"
```

Then split panes over `{{worktrees}}/agent-$i` using the geometry blocks above. Ship a cleanup recipe alongside it:

```just
# Remove agent worktrees and their branches.
[confirm]
[group('workflow')]
agents-clean:
    #!/usr/bin/env bash
    set -uo pipefail
    for wt in "{{worktrees}}"/agent-*; do
      [ -d "$wt" ] || continue
      git -C "{{justfile_directory()}}" worktree remove --force "$wt" || true
      git -C "{{justfile_directory()}}" branch -D "$(basename "$wt")" 2>/dev/null || true
    done
```

Rules for agent grids:

- Always `[confirm]` above two panes — each pane is a billed session.
- Give each pane a distinct name and a distinct opening prompt; four identical panes duplicate work.
- Add `.gitignore` entries for the worktree directory.
- Never use `--dangerously-skip-permissions` in a generated recipe. If the user asks for it, make it an explicit opt-in parameter with a default of off.
