# plugin-marketplace

Béla's Claude Code plugins: mods (function-hook plugins that draw panes, bands and status
lines), the skill that builds them, and personal skills grouped by theme.

| Plugin | What it is |
| --- | --- |
| [`mods`](plugins/mods/README.md) | `/mods` opens a keyboard-driven pane that lists your mods, shows what each one does, and switches it on/off now or at startup. |
| [`mod-builder`](plugins/mod-builder/skills/mod-builder/SKILL.md) | A skill that builds new mods to a fixed bar: four tested templates, a mandatory `/<mod> on\|off`, a bare `/<mod>` that toggles what it opened, keyboard-first panes, and a validate + type-check + test gate. |
| [`briefings`](plugins/briefings/skills) | `ai-`, `tech-`, `geo-`, `cyber-`, `econ-`, `space-briefing`, and `morning-briefing`, which runs them all into one digest. |
| [`decks`](plugins/decks/skills) | `marp-deck` (Marp slides on a tech topic), `feature-deck` (researches a release and hands it to marp-deck), `obsidian-canvas`. Decks go to `$MARP_DECKS_DIR`, else `~/Documents/Presentations`. |
| [`dev-tools`](plugins/dev-tools/skills) | `cleanup`, `deps-audit`, `docgen`, `explain`, `find-bug`, `justify`, `package-scout`, `quick-commit`, `review-pr`, `scaffold`, `summarize-changes`. |
| [`skill-tools`](plugins/skill-tools/skills) | `skill-writer`, `skill-refactor`, `skill-guide`, `agent-retro`. |

## Install

At the prompt of a terminal Claude Code session:

```
/plugin install mods --marketplace B314-N03/plugin-marketplace
/plugin install mod-builder --marketplace B314-N03/plugin-marketplace
/plugin install briefings --marketplace B314-N03/plugin-marketplace
/plugin install decks --marketplace B314-N03/plugin-marketplace
/plugin install dev-tools --marketplace B314-N03/plugin-marketplace
/plugin install skill-tools --marketplace B314-N03/plugin-marketplace
```

A plugin's skills are called by their namespaced name, e.g. `/briefings:ai-briefing`.

Answer `y` to add the marketplace the first time, then choose the user scope. Get updates
with `claude plugin update <name>`, then `/reload-plugins`.

## Developing here

Add your clone as a folder marketplace instead. Installed plugins are then read straight
from the folder, so an edit reaches a session after `/reload-plugins`, with no version bump:

```
claude plugin marketplace add ~/Coding/plugin-marketplace
claude plugin install mods@b314
claude plugin install mod-builder@b314
# and briefings@b314, decks@b314, dev-tools@b314, skill-tools@b314
```

Gate a plugin before committing (the types file path is the one the built-in
`plugin-authoring` skill names when it loads):

```
bash plugins/mod-builder/skills/mod-builder/scripts/check.sh plugins/mods <types-file>
```

It must end with `== PASS`. `claude plugin validate .` checks the marketplace file.

## Layout

```
.claude-plugin/marketplace.json   the plugin list
plugins/mods/                     hooks module, pure logic, tests, types contract
plugins/mod-builder/skills/mod-builder/
  SKILL.md                        the build procedure
  reference/conventions.md        the rules (off switch, keyboard, tests)
  templates/                      status-line, band-pane, tool-hook, poller
  scripts/                        new-mod.sh, check.sh, promote.sh
```
