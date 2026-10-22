#!/usr/bin/env bash
# Start a mod from a template under a new name.
# Usage: new-mod.sh <status-line|band-pane|tool-hook|poller> <mod-name> <parent-dir> [--ui]
#   --ui: make the hooks module .tsx, for a mod that will also draw a band or pane
set -euo pipefail

template="${1:?usage: new-mod.sh <template> <mod-name> <parent-dir>}"
name="${2:?mod name missing}"
parent="${3:?parent dir missing}"
ui="${4:-}"
skill_dir="$(cd "$(dirname "$0")/.." && pwd)"
src="$skill_dir/templates/$template"

[ -d "$src" ] || { echo "unknown template: $template (have: status-line band-pane tool-hook poller)"; exit 1; }
[[ "$name" =~ ^[a-z][a-z0-9-]{1,40}$ ]] || { echo "mod name must be kebab-case: $name"; exit 1; }
dest="$parent/$name"
[ -e "$dest" ] && { echo "already exists: $dest"; exit 1; }

old="$(sed -n 's/.*"name": *"\([^"]*\)".*/\1/p' "$src/.claude-plugin/plugin.json")"
pascal() { echo "$1" | awk -F- '{ for (i = 1; i <= NF; i++) printf "%s%s", toupper(substr($i, 1, 1)), substr($i, 2) }'; }
old_pascal="$(pascal "$old")"
new_pascal="$(pascal "$name")"

mkdir -p "$parent"
cp -R "$src" "$dest"
rm -rf "$dest/.claude-plugin/types" "$dest/tsconfig.json"
find "$dest" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.md' \) -print0 |
  xargs -0 sed -i.bak -e "s/$old/$name/g" -e "s/$old_pascal/$new_pascal/g"
find "$dest" -name '*.bak' -delete
sed "s/__MOD__/$name/g" "$skill_dir/templates/README.md" >"$dest/README.md"

if [ "$ui" = "--ui" ] && [ -f "$dest/hooks/register.ts" ]; then
  mv "$dest/hooks/register.ts" "$dest/hooks/register.tsx"
  printf '{ "modules": ["./register.tsx"] }\n' >"$dest/hooks/hooks.json"
  echo "hooks module is register.tsx (JSX enabled)"
fi

echo "created $dest from $template ($old → $name)"
