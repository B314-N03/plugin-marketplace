#!/usr/bin/env bash
# Copy a finished mod to the mod home, so it can load in every session.
# Usage: promote.sh <mod-dir> [mods-home]
#   mods-home: argument, else $CLAUDE_MODS_HOME, else ~/claude-mods
set -euo pipefail

src="$(cd "${1:?usage: promote.sh <mod-dir> [mods-home]}" && pwd)"
home="${2:-${CLAUDE_MODS_HOME:-$HOME/claude-mods}}"
name="$(basename "$src")"
dest="$home/$name"

mkdir -p "$dest"
# Engine-written files (.claude-plugin/types, tsconfig.json) are laid again on load.
rsync -a --delete --exclude '.claude-plugin/types/' --exclude 'tsconfig.json' --exclude 'node_modules/' "$src/" "$dest/"

echo "promoted: $dest"
case ":${CLAUDE_CODE_PLUGIN_DIRS:-}:" in
  *":$dest:"*) echo "already listed in CLAUDE_CODE_PLUGIN_DIRS" ;;
  *) echo "next: add $dest to CLAUDE_CODE_PLUGIN_DIRS (env block of the user settings), ':'-separated" ;;
esac
