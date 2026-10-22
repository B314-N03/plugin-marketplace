# Justfile Patterns

`just` syntax needed to write orchestration recipes, weighted toward the parts that are easy to get wrong.

## Table of Contents

- Anatomy
- Variables and Paths
- Line Prefixes and Escaping
- Shebang Recipes
- Dependencies
- Parameters
- Attributes
- Settings
- Stack Recipes by Ecosystem
- Splitting a Large Justfile
- Verification Commands

## Anatomy

```just
# This line becomes the recipe's `just --list` description.
recipe-name: dependency-a dependency-b
    command one
    command two
```

**Keep that comment to one line.** just takes only the *last* line of a contiguous comment block
as the description, so a two-line comment lists the second half and hides the first. When a recipe
needs a longer explanation, put the prose above and separate it with a blank line — the blank line
detaches it, and the single line left touching the recipe becomes the description:

```just
# Long rationale about why this recipe exists, what it will not do,
# and which other recipe to prefer.

# Kill whatever holds the stack's default ports.
kill:
    -lsof -ti tcp:3000 | xargs kill 2>/dev/null || true
```

Recipe bodies are indented consistently (spaces or tabs, not mixed). Each line runs in its **own shell** unless the recipe has a shebang — so `cd foo` on one line does not affect the next. Chain with `&&` or use a shebang recipe.

The first recipe in the file is the default. Make it the listing:

```just
# Show available recipes.
default:
    @just --list
```

## Variables and Paths

```just
project_dir := justfile_directory()
backend     := justfile_directory() / "packages/backend"
sibling     := "/Users/name/Coding/other-repo"     # outside the repo: absolute
state_dir   := justfile_directory() / ".devstack"
```

`/` is the path-join operator. `justfile_directory()` makes recipes work from any subdirectory — prefer it over relative paths in every generated recipe.

Other useful functions: `env_var_or_default("PORT", "3000")`, `os()`, `arch()`, `invocation_directory()`, `shell("cmd")`.

## Line Prefixes and Escaping

| Prefix | Effect |
|--------|--------|
| `@` | do not echo the line before running it |
| `-` | keep going if the line exits non-zero |
| `@-` | both |

Escaping:

- `{{name}}` interpolates a variable or parameter.
- A **literal** `{{` needs doubling: `{{{{`. This bites on docker format strings:
  ```just
  ps:
      @docker ps --format 'table {{{{.Names}}\t{{{{.Status}}'
  ```
- Inside a shebang recipe, `$VAR` is left for the shell; `{{VAR}}` is still resolved by just first.

## Shebang Recipes

Use one whenever the recipe needs multi-line shell logic, loops, functions, or a heredoc. The whole body becomes a single script.

```just
down:
    #!/usr/bin/env bash
    set -euo pipefail
    for f in "{{state_dir}}"/*.pid; do
      echo "stopping $(basename "$f" .pid)"
    done
```

Use `set -euo pipefail` for start recipes. For teardown use `set -uo pipefail` (without `-e`) so one already-dead process does not abort the rest of the cleanup.

## Dependencies

```just
up: infra migrate          # run before this recipe's body
deploy: build && notify    # `&&` deps run after the body
```

Dependencies run once per invocation even if several recipes require them. `[parallel]` runs a recipe's dependencies concurrently — useful for independent docker groups, wrong for anything ordered.

## Parameters

```just
# Tail one service log.
logs name:
    tail -f "{{state_dir}}/{{name}}.log"

# Open N agent panes.
agents count="4":
    echo "{{count}}"

# Pass everything through.
[positional-arguments]
run *args:
    npm run "$@"
```

Parameters with defaults must follow those without. `*args` is variadic (zero or more), `+args` requires at least one.

## Attributes

| Attribute | Use in orchestration recipes |
|-----------|------------------------------|
| `[group('stack')]` | bucket recipes in `just --list`; use `stack`, `infra`, `workflow`, `lifecycle` |
| `[confirm]` / `[confirm('text')]` | anything destructive or billed: `down`, `kill`, agent grids |
| `[macos]` / `[linux]` / `[unix]` / `[windows]` | guard AppleScript and other platform-specific recipes |
| `[private]` | internal helper recipes, hidden from the listing |
| `[no-cd]` | run in the caller's directory instead of the justfile's |
| `[working-directory('sub')]` | pin one recipe to a subdirectory |
| `[parallel]` | run this recipe's dependencies concurrently |
| `[doc('text')]` | description when the comment above is not the right text |
| `[no-exit-message]` | suppress just's error banner on expected non-zero exits |

Attributes stack, one per line, directly above the recipe (after its doc comment).

## Settings

```just
set shell := ["bash", "-uc"]      # default shell for non-shebang lines
set dotenv-load                   # load .env automatically
set dotenv-filename := ".env.dev"
set export                        # export all just variables as env vars
set positional-arguments          # $1, $2 in every recipe
set quiet                         # do not echo any line (like @ everywhere)
```

Do not add `set dotenv-load` to a justfile that has no `.env` file, and never print loaded values in a recipe.

## Stack Recipes by Ecosystem

Derive commands from what discovery found, not from this table — it only shows the expected shape.

| Stack | Foreground dev server | Detached infra |
|-------|----------------------|----------------|
| Vite / Next | `npm run dev` in the package dir | — |
| Node API | `npm run dev` | `docker compose up -d` |
| Spring Boot (maven) | `./mvnw spring-boot:run` | `docker compose up -d` |
| Gradle | `./gradlew run` or `bootRun` | `docker compose up -d` |
| Django | `uv run python3 manage.py runserver` | `docker compose up -d db` |
| Rust | `cargo watch -x run` | — |

Compose profiles matter: `docker compose --profile dev up -d` starts only the dev subset. If the compose file defines profiles, name the profile explicitly rather than starting everything.

When a JDK or toolchain version is pinned by the project, pin it in the recipe too and say why in a comment:

```just
# Pins JDK 21 (the pom's java.version) so a stale JAVA_HOME does not break the build.
engine:
    cd "{{engine_dir}}" && JAVA_HOME="$(/usr/libexec/java_home -v 21)" ./mvnw spring-boot:run
```

## Splitting a Large Justfile

Past roughly 150 lines, split by concern and import:

```just
import 'just/stack.just'
import? 'just/local.just'     # optional: no error if missing
```

`import?` is the right way to let a developer keep machine-specific paths out of the committed file.

## Verification Commands

| Command | Checks |
|---------|--------|
| `just --summary` | **the parse gate** — exits 1 with file:line on a syntax error |
| `just --list` | recipes and the description just actually derived from each comment block |
| `just -n RECIPE` | dry run: prints fully expanded commands, executes nothing |
| `just --groups` | group names resolve |
| `just --evaluate` | prints every variable's resolved value |
| `just --fmt --unstable` | rewrites into canonical form; only on a justfile you just created, since it reflows the entire file |

Do not gate on `just --fmt --check`: it fails on purely cosmetic differences such as aligned `:=`
columns, `{{var}}` versus `{{ var }}`, and attribute ordering. A justfile can be perfectly valid
and still fail that check.

`just -n` on a pane-splitting recipe prints the complete AppleScript without opening anything — always read that output before claiming a layout works.
