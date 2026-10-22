---
name: skill-guide
description: Shows an overview of the user's installed Claude Code skills and plugin commands, either as a guided tour that asks which areas to explain before going deeper, or as a keyword lookup (a plugin name, a marketplace name, personal, project, builtin, or any search term) that explains one group, how its skills chain together, and how to call them.
when_to_use: When the user asks which skills or slash commands they have, forgot what a skill is called, asks "what does /x do", "which skill should I use for …", "show me my <plugin> skills", or wants a tour of their setup. Skip when the user wants to create or edit a skill (skill-writer, skill-refactor).
argument-hint: "[<plugin>|<marketplace>|personal|project|builtin|<search term>]"
arguments: keyword
allowed-tools: Bash(uv run python3 *skill-guide/scripts/scan.py *)
---

# Skill Guide

The inventory is always read live, never from memory. The scanner reads `~/.claude/skills/`
(group `personal`), `.claude/skills/` under the working directory (group `project`) and every
plugin in `~/.claude/plugins/installed_plugins.json`. Groups are detected, not configured: each
plugin is a group named after itself, and its marketplace is the **suite** above it (e.g. suite
`b314` holds `briefings`, `decks`, `dev-tools`, …). A keyword may name either level.

```bash
uv run python3 ${CLAUDE_SKILL_DIR}/scripts/scan.py groups     # suites, their groups + counts
uv run python3 ${CLAUDE_SKILL_DIR}/scripts/scan.py <group>    # one plugin or suite, full detail
uv run python3 ${CLAUDE_SKILL_DIR}/scripts/scan.py <term>     # search names + descriptions
```

Keyword received: `$keyword` (empty means tour mode).

## Standing rules

- **Live data only.** Every skill you name must come from scanner output or, for the `builtin` group, from the available-skills list in this session's system context. Never describe a skill from memory, because a skill may have been renamed or uninstalled.
- **Built-ins are not on disk.** The `builtin` group is every entry in the session's available-skills list that has no `plugin:` prefix and is missing from the scanner output (e.g. `code-review`, `simplify`, `loop`, `schedule`, `init`, `run`, `update-config`). Treat them like any other group.
- **`links` are mentions, not proof of a call.** The scanner lists the other skills that a skill's text names. Before you draw an arrow from A to B, check the descriptions to see which one invokes the other. A description that says "composes X" or "dispatched by Y" settles it.
- **Never dump everything at once.** A full listing of every group would run past 140 entries, so stick to the mode flow below.
- Reply in the user's language and keep it scannable: headings, short lines, real command names in backticks.

## Mode A: tour (no keyword)

1. Run `scan.py groups` and add a `builtin` count from the session list.
2. Show a one-line menu per suite (listing its groups) or per loose group: name, count, and a 6–10 word summary of what the group is for (draw it from a quick look at that group's descriptions). Then ask which groups to go into. Ask in plain text, not with AskUserQuestion, because there are more groups than its 4-option limit allows. Offer "all, one at a time" as a choice.
3. Explain each chosen group as described in **Explaining a group**. After each one, ask whether to continue with the next group, go deeper on a specific skill, or stop.

## Mode B: keyword

- If the keyword is a group or suite name, or `builtin`, explain it directly (a suite: one section per group). Don't show a menu.
- Otherwise run `scan.py <term>` and present the matches grouped. If nothing matches, show the group menu from Mode A and say that the term didn't match.

## Explaining a group

Order matters. Show the big picture first, then the details:

1. **Flow**: if the group's skills chain together, open with a small ASCII flow of the main path, e.g. `dispatch → work-task (→ checklist-plan, security-review) → merge-task`, plus one sentence on where a human steps in. Build it from `links` checked against the descriptions.
2. **Entry points**: these are the commands the user types. For each one, give the invoke string (with `argument-hint` if present), *when* to reach for it in one line, and one concrete example call.
3. **Under the hood**: list skills flagged `internal`, plus skills that other skills mainly dispatch, on one compact line each, or as a single "N helper skills (…)" line when there are more than 8.
4. **Gotchas**: point out duplicates (`also installed as`) and say which one wins. A personal skill and a plugin skill that share a name both show up, and the namespaced form is always unambiguous. Also flag skills in the group that are easy to confuse, with one line on how to tell them apart.

For large groups or suites (more than 15 entries), lead with the entry-point commands only. Collapse the rest under "under the hood" and offer to expand.

## Failure handling

- Scanner errors (missing `installed_plugins.json`, unreadable file): report the error line, fall back to the session's available-skills list, and say the details are thinner because of it.
- A plugin with neither `skills/` nor `commands/` (a hooks-only mod) has nothing to list and does not appear; say so if the user asks about one.
