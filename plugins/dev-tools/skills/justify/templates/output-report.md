# Output Report Template

Report after the verification step passes. Keep it short — the justfile is the deliverable.

```markdown
**`justfile`** — <created | extended with N recipes>

| Recipe | Does |
|--------|------|
| `just up` | docker infra + 4-pane iTerm tab (backend · frontend · worker · tests) |
| `just down` | stops the tracked PID trees, then docker |
| `just backend` | backend alone, foreground |

Driver: iTerm2 AppleScript (`$TERM_PROGRAM` is `iTerm.app`).

Verified: `just --fmt --check` clean · `just --list` shows all recipes · `just -n up` expands correctly.

<One line per assumption that needs confirming, or per thing deliberately left out. Omit the
section entirely when there is nothing to flag.>

Not run yet — `just up` will open a tab and start 4 servers. Say the word.
```

Rules:

- Name the driver and why it was chosen.
- Show the verification commands that actually ran, not a claim that it works.
- Never report a stack as running unless it was actually started and observed.
- Flag every guessed path or port explicitly rather than burying it in the table.
