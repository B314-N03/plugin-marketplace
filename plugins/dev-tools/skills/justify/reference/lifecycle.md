# Lifecycle

Every recipe that starts background work needs a matching stop. This file covers tracking, teardown, health checks, and status.

## Table of Contents

- Track PIDs, Not Ports
- The State Directory
- Recording a PID
- Teardown
- Port-Based Fallback
- Docker Infra
- Health Waits
- Status and Logs
- Gitignore

## Track PIDs, Not Ports

Killing by port (`lsof -ti tcp:3000 | xargs kill`) will happily kill a **different** project's server that happens to hold that port, and misses any server on a dynamically assigned one. Record what you started and kill exactly that.

Ports are acceptable only as a clearly labeled last-resort recipe.

## The State Directory

```just
state_dir := justfile_directory() / ".devstack"
```

One `<service>.pid` per running service, plus `<service>.log` when using the background driver. Create it with `mkdir -p` at the top of every start recipe.

## Recording a PID

In an iTerm2 or tmux pane, record the **pane shell's** PID as the first thing the pane runs:

```
write text "echo $$ > \"{{state_dir}}/backend.pid\"; cd \"{{backend_dir}}\" && npm run dev"
```

`$$` is the shell, and the dev server becomes its child — so killing the shell's process tree stops the server and closes the pane. This works even when the dev command spawns its own children, which is the normal case for `npm run dev` and Gradle.

For the background driver, record the job PID instead:

```bash
( cd "$dir" && nohup "$@" > "{{state_dir}}/$name.log" 2>&1 & echo $! > "{{state_dir}}/$name.pid" )
```

## Teardown

A dev server almost never has a single process. `npm run dev` is a shell wrapping npm wrapping node; Gradle forks a daemon. Killing only the recorded PID orphans the children, which keep the port bound. Walk the tree:

```just
# Stop everything `just up` started, then the docker infra.
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
    ( cd "{{docker_dir}}" && docker compose down ) || true
```

Details that matter:

- `set -uo pipefail` without `-e`, so an already-dead service does not abort the loop.
- `kill -0` tests liveness without signalling.
- `shopt -s nullglob` stops the loop from iterating over a literal `*.pid` when none exist.
- Children are killed depth-first, before the parent, so nothing is reparented and left running.
- Stale pid files are removed either way.
- Docker teardown runs last and is wrapped in `|| true`.

For tmux-driven stacks all of this collapses to `tmux kill-session -t {{session}}` — no pid tracking needed.

## Port-Based Fallback

Ship it only alongside a PID-based `down`, and label the risk in the doc comment:

```just
# May hit an UNRELATED server on the same port — prefer `just down`, which only
# stops tracked PIDs.

# Last resort: kill whatever holds the stack's default ports.
[confirm]
[group('lifecycle')]
kill:
    -lsof -ti tcp:3000 | xargs kill 2>/dev/null || true
```

## Docker Infra

Split detached containers from foreground servers so each can be restarted alone.

```just
# Start only the detached docker services (no dev servers).
[group('infra')]
infra: db observability
    @echo "Docker infra running (see: just ps)."

# Postgres only — the `app` service stays behind the `full` profile.
[group('infra')]
db:
    cd "{{backend_dir}}" && docker compose up -d
```

Run `docker compose up -d` from the directory holding the compose file rather than passing a guessed `-f` path, and name profiles explicitly when the file defines them.

## Health Waits

When one service must be up before another, poll rather than sleep:

```bash
until curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; do sleep 1; done
```

Bound it so a broken service does not hang the recipe forever:

```bash
for _ in $(seq 1 60); do          # 60 tries at 1s = 2x the observed cold start
  curl -sf "$url" >/dev/null 2>&1 && break
  sleep 1
done
```

Justify the bound in a comment; an unexplained magic number is worse than no bound.

## Status and Logs

```just
# Status of the stack's docker containers.
[group('lifecycle')]
ps:
    @docker ps --filter name={{project}} --format 'table {{{{.Names}}\t{{{{.Status}}\t{{{{.Ports}}'

# Which tracked services are still alive.
[group('lifecycle')]
status:
    #!/usr/bin/env bash
    shopt -s nullglob
    for f in "{{state_dir}}"/*.pid; do
      pid="$(cat "$f")"
      if kill -0 "$pid" 2>/dev/null; then echo "up    $(basename "$f" .pid) ($pid)"; else echo "dead  $(basename "$f" .pid)"; fi
    done

# Tail one service log (background driver only).
[group('lifecycle')]
logs name:
    tail -f "{{state_dir}}/{{name}}.log"
```

Note the `{{{{` doubling in the docker format string — a single `{{` would be read as interpolation.

## Gitignore

Add the state directory and any agent worktree directory:

```
.devstack/
-worktrees/
```
