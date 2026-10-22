# mods

A pane that lists every mod you have: what it does, its slash commands, whether it's on, and
whether it loads in new sessions. Each mod has buttons to switch it.

## Where it looks

- **Mods home:** `$CLAUDE_MODS_HOME`, else `~/claude-mods`. Every folder there with a
  `.claude-plugin/plugin.json` is one row.
- **Session folders:** `~/.claude/dev-mods/<session>/<mod>`. A mod found only there (not yet
  promoted) is listed as "session folder only". Session copies of a home mod are hidden.
- **Startup list:** `env.CLAUDE_CODE_PLUGIN_DIRS` in `~/.claude/settings.json`.
- **Loaded now:** the slash commands registered in this session (`$.command.list()`).

## Commands

| Command | What it does |
| --- | --- |
| `/mods off` | Turns the manager off: closes the pane, also in new sessions |
| `/mods on` | Turns it back on and opens the pane |
| `/mods` | Rescans and opens the pane; closes it while it is shown |
| `/mods list` | Prints the same overview as text |

## Using the pane (keyboard)

The pane opens with the keyboard focus and takes it back after `t` runs a mod's command. If the keys ever end up in the prompt (you typed, or `s` opened another pane), `ctrl+x tab` gives them back to the pane. Esc closes it.

| Key | Does |
| --- | --- |
| `1`-`9` | Picks that mod (marked `›`) |
| `t` | Turns the picked mod off or on via its own `/<command> off\|on` (remembered in new sessions). Only for mods loaded in this session |
| `s` | Runs its command with no arguments: opens or closes its pane, or (no pane) toggles it |
| `l` | Load at start / don't: adds or removes its folder in `CLAUDE_CODE_PLUGIN_DIRS` in `~/.claude/settings.json`, nothing else touched; applies to new sessions |
| `r` | Rescans |

In the fullscreen layout each key's label can also be clicked.

On/off is what the manager last saw. It records every `/<command> on|off`, whether you typed it or
pressed a button. A mod nobody has switched since the manager was installed shows "loaded".

## What it runs

Nothing in the background: it reads files and the command list only when the pane opens, after a
button press, or on Refresh. A button that switches a mod at start writes `~/.claude/settings.json`.

## Install

```
/plugin install mods --marketplace B314-N03/plugin-marketplace
```

Answer `y` to add the marketplace, then pick the user scope.

## Remove it

`/plugin uninstall mods`, or `/mods off` to keep it installed but closed.
