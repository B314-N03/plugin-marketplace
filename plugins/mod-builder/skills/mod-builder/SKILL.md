---
name: mod-builder
description: 'Builds Claude Code mods (function-hook plugins) to a fixed quality bar: a short clarify step, a tested template (status line, band and pane, tool or prompt guard, background poller), a mandatory /<mod> on|off switch, a bare /<mod> that toggles what it opened, keyboard-first bands and panes (hotkeys, focus, Esc), pure logic split out for tests, a gate that runs validate + a proven type-check + tests, a README, and promotion to a mods folder every session loads. Layers on the built-in plugin-authoring skill for the API.'
when_to_use: 'When the user wants a new mod or wants to change one: a status line entry, toast, band above the prompt, side pane, slash command, a hook that blocks or rewrites tool calls or prompts, or a background poller that shows live state. Also when promoting a session mod so every session loads it. Skip for settings hooks in settings.json (update-config) and for skills or MCP servers.'
---

# Mod builder

A mod is a folder with `.claude-plugin/plugin.json`, `hooks/hooks.json` and a hooks module.
This skill decides **how** a mod is built; the built-in `plugin-authoring` skill says **what
the API is**. Paths below in `<angle brackets>` are resolved at run time, never hardcoded:

| Placeholder | Where it comes from |
| --- | --- |
| `<skill-dir>` | this skill's base directory, as the Skill tool reports it |
| `<session-mods>` | the "WHERE TO WRITE IT" folder `plugin-authoring` names when it loads |
| `<types-file>` | the `claude-code.d.ts` path `plugin-authoring` names when it loads |
| `<mods-home>` | `$CLAUDE_MODS_HOME` if set, else `~/claude-mods` |

## 0. Load the API

Invoke the `plugin-authoring` skill first, every time; the API is early access and moves
between releases. Note `<session-mods>` and `<types-file>` from its text. Before using an
event, a `$` method or an element prop you have not used in this session, grep
`<types-file>` for it and read the declaration. Then read
[`reference/conventions.md`](reference/conventions.md): it is the rule set for every step below.

## 1. Clarify (ask before building)

Ask with `AskUserQuestion`, in one round, only what the request leaves open:

- **What it shows or does**, and from which data (git, `gh`, files, the session's own events).
- **Surface:** text only (status line / toast / command answer), band, pane, or a tool/prompt
  hook. Recommend the lightest one that does the job. For a pane: does the person **act** in
  it (interactive: takes the keyboard on open) or only **read** it (status: never steals
  the prompt)? See conventions → Keyboard.
- **When it updates:** on events (turn end, tool call) or on a timer, and how often.
- **Default and scope:** on by default? auto-open a pane, and when? which repos it applies
  to (detect by repo/branch at run time, never by a hardcoded path).
- **Name:** kebab-case; it is also the command (`/<name>`).

Skip the round only when every point is already answered, and say so.

## 2. Start from a template

| Template | Surfaces | Pattern it shows |
| --- | --- | --- |
| `status-line` | status line, toast, command | event-driven text, transition toast |
| `band-pane` | band above the prompt, pane, buttons | `$.state` atoms read while drawing |
| `tool-hook` | `tool.call` guard + observer | fail-closed guard, fail-open observer, engine-level test |
| `poller` | status line, toast | timer in `session.start`, `$.process.run`, change detection |

```bash
bash <skill-dir>/scripts/new-mod.sh <template> <name> <session-mods> [--ui]
```

The script copies the template, renames every identifier (`tpl-…` → `<name>`, `Tpl…` →
`<Name>`), and adds the README skeleton. Mixed needs (a poller that also draws a band or
pane): start from the closest template with `--ui`, which makes the hooks module `.tsx`,
and port the drawing pattern and `tests/ui.test.tsx` from `band-pane` by hand.

Writing under `<session-mods>` triggers Claude Code's one-time "Enable hot reloading?"
question. The person answers it; on yes the mod loads when the turn ends and every later
edit reloads it.

## 3. Implement

- Put parsing, formatting and change detection in `hooks/logic.ts`; keep the hooks module thin.
- Keep the off switch from the template working. A new surface must honour it too.
- Keep the bare-command toggle (conventions → The off switch) and give every `Button` a
  `hotkey` (conventions → Keyboard). A pane action that runs `$.command.run` reopens its
  pane with `focus: true` afterwards.
- Update `plugin.json`'s `description`, the `types` contract, and the tests for the new behaviour.

## 4. Gate

```bash
bash <skill-dir>/scripts/check.sh <session-mods>/<name> <types-file>
```

It must end with `== PASS`: validation, a type-check that proves it checked the mod's
files, and the tests. A mod that draws a band or pane needs a UI test that mounts it
(conventions → Verification). On `== FAIL`, read the reason, fix the cause, rerun. For a guard,
also break its rule once on a copy (`cp -R` the mod to a scratch folder, mutate, run
`claude plugin test <copy>`) and confirm a test fails.

## 5. README

Fill in `<mod>/README.md`: what it shows, every command, what it runs and how often,
how to remove it.

## 6. Hand over

Tell the person, briefly: what it shows and where, its commands (`/<name> off` first,
then what a bare `/<name>` toggles) and its keys,
what you verified (gate output) and what you could not (layout, colours, placement:
those need their eyes once it loads). If hot reloading was declined, it loads in the
next session started with `claude --plugin-dir <session-mods>/<name>`.

## 7. Promote (when the person is happy)

`<session-mods>` belongs to one session. To load a mod everywhere:

```bash
bash <skill-dir>/scripts/promote.sh <session-mods>/<name>
```

Then add the printed path to `CLAUDE_CODE_PLUGIN_DIRS` in the `env` block of the user
settings, using the `update-config` skill: `:`-separated, keeping every existing entry.
It takes effect in sessions started afterwards. To change a promoted mod later, edit it in
`<mods-home>` directly and rerun the gate there; interactive sessions watch that folder.

To share a mod with others, follow "Sharing a mod" in the `plugin-authoring` reference
(a `marketplace.json` in a repository and one `/plugin install` line). A marketplace repo
keeps each plugin under `plugins/<name>/` with an entry `{ "name", "source": "./plugins/<name>" }`;
run the gate on the copy there before committing, and ignore `.claude-plugin/types/`
(the engine writes it on load).
