# Devstack Justfile Template

Skeleton for a generated orchestration justfile. Replace names, paths, and commands with what discovery actually found; delete sections that do not apply. The header comment is not optional — it is the first thing a new developer reads.

```just
# <Project> dev-stack orchestrator.
#
# One command to boot the whole stack:
#   - detached docker infra
#   - ONE iTerm tab split into a pane per long-running dev server
#
# `just up` records each pane shell's PID under {{state_dir}}; `just down` kills exactly
# those process trees (then the docker infra) — so it never guesses ports or touches a
# server it did not start.
#
# Requires: just (`brew install just`), iTerm2, docker.

backend_dir  := justfile_directory() / "packages/backend"
frontend_dir := justfile_directory() / "packages/frontend"
sibling_dir  := "/absolute/path/to/sibling-repo"       # outside this repo
state_dir    := justfile_directory() / ".devstack"

# Show available recipes.
default:
    @just --list

# --- entry point --------------------------------------------------------------

# Boot everything: infra detached + one iTerm tab, 2x2 — backend/frontend over worker/tests.
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
          set bottomRight to (split horizontally with default profile)
        end tell
        tell bottomLeft
          set name to "worker"
          write text "printf '\\033]0;worker\\007'; echo $$ > \"{{state_dir}}/worker.pid\"; cd \"{{backend_dir}}\" && npm run worker"
        end tell
        tell bottomRight
          set name to "tests"
          write text "printf '\\033]0;tests\\007'; cd \"{{justfile_directory()}}\" && npm run test:watch"
        end tell
      end tell
    end tell
    APPLESCRIPT
    echo "Stack up (1 tab, 4 panes). frontend → http://localhost:5173 · backend → http://localhost:3000"

# --- infra (detached) ---------------------------------------------------------

# Start only the detached docker services (no dev servers).
[group('infra')]
infra: db
    @echo "Docker infra running (see: just ps)."

# Postgres and redis.
[group('infra')]
db:
    cd "{{backend_dir}}" && docker compose up -d

# --- individual foreground servers (block; run one per terminal) --------------

# Backend API (port 3000).
[group('stack')]
backend:
    cd "{{backend_dir}}" && npm run dev

# Frontend dev server (port 5173).
[group('stack')]
frontend:
    cd "{{frontend_dir}}" && npm run dev

# --- lifecycle ----------------------------------------------------------------

# Stop everything `just up` started: each tracked pane-server process tree, then docker.
[group('lifecycle')]
down:
    #!/usr/bin/env bash
    set -uo pipefail
    kill_tree() { local p="$1" c; for c in $(pgrep -P "$p" 2>/dev/null); do kill_tree "$c"; done; kill "$p" 2>/dev/null || true; }
    shopt -s nullglob
    for f in "{{state_dir}}"/*.pid; do
      pid="$(cat "$f" 2>/dev/null || true)"
      if [ -n "${pid:-}" ] && kill -0 "$pid" 2>/dev/null; then
        echo "stopping $(basename "$f" .pid) (pid tree $pid)"
        kill_tree "$pid"
      fi
      rm -f "$f"
    done
    ( cd "{{backend_dir}}" && docker compose down ) || true

# Which tracked services are still alive.
[group('lifecycle')]
status:
    #!/usr/bin/env bash
    shopt -s nullglob
    for f in "{{state_dir}}"/*.pid; do
      pid="$(cat "$f")"
      if kill -0 "$pid" 2>/dev/null; then echo "up    $(basename "$f" .pid) ($pid)"; else echo "dead  $(basename "$f" .pid)"; fi
    done

# Status of the stack's docker containers.
[group('lifecycle')]
ps:
    @docker ps --filter name=<project> --format 'table {{{{.Names}}\t{{{{.Status}}\t{{{{.Ports}}'

# May hit an UNRELATED server on the same port — prefer `just down`, which only
# stops tracked PIDs.

# Last resort: kill whatever holds the stack's default ports.
[confirm]
[group('lifecycle')]
kill:
    -lsof -ti tcp:3000 | xargs kill 2>/dev/null || true
    -lsof -ti tcp:5173 | xargs kill 2>/dev/null || true
```

## Checklist before handing it over

- [ ] Every command traces to a real script, compose service, or wrapper found in the repo.
- [ ] Absolute paths only for directories outside the repo; everything else via `justfile_directory()`.
- [ ] Every recipe has a doc comment and a group.
- [ ] `up` has a matching `down` that kills by tracked PID.
- [ ] Ports in the final `echo` match the actual config.
- [ ] `{{{{` doubling used in any docker `--format` string.
- [ ] State directory added to `.gitignore`.
