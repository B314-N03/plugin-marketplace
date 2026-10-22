#!/usr/bin/env bash
# Gate for a Claude Code mod: validate, type-check (proven to have run), test.
# Usage: check.sh <mod-dir> [types-file]
#   types-file: the claude-code.d.ts the plugin-authoring skill names. Needed only
#   before the engine has loaded the mod (afterwards it lays its own tsconfig).
set -uo pipefail

mod="${1:?usage: check.sh <mod-dir> [types-file]}"
types="${2:-${CLAUDE_MOD_TYPES:-}}"
mod="$(cd "$mod" && pwd)"
failed=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "== validate"
claude plugin validate "$mod" >"$tmp/validate.log" 2>&1
validate_exit=$?
grep -E '✔' "$tmp/validate.log"
if [ "$validate_exit" -ne 0 ] || grep -q '✘' "$tmp/validate.log"; then
  sed -n '/✘/,$p' "$tmp/validate.log"
  failed=1
fi

echo "== typecheck"
if [ -f "$mod/.claude-plugin/types/tsconfig.json" ] && [ -f "$mod/tsconfig.json" ]; then
  config="$mod/tsconfig.json"
elif [ -n "$types" ] && [ -f "$types" ]; then
  config="$tmp/tsconfig.json"
  cat >"$config" <<JSON
{
  "compilerOptions": {
    "target": "es2023", "lib": ["es2023"], "types": [],
    "module": "esnext", "moduleResolution": "bundler",
    "strict": true, "noUncheckedIndexedAccess": true,
    "noEmit": true, "skipLibCheck": true,
    "jsx": "react", "jsxFactory": "h", "jsxFragmentFactory": "Fragment"
  },
  "files": ["$types"],
  "include": ["$mod/hooks", "$mod/types", "$mod/tests"]
}
JSON
else
  echo "no types: pass the claude-code.d.ts path the plugin-authoring skill names, or let the engine load the mod first"
  config=""
  failed=1
fi
if [ -n "$config" ]; then
  npx -y -p typescript@5.6.3 tsc -p "$config" --listFiles >"$tmp/tsc.log" 2>&1
  tsc_exit=$?
  checked=$(grep -c "^$mod/" "$tmp/tsc.log")
  grep -E 'error TS' "$tmp/tsc.log"
  if [ "$checked" -eq 0 ]; then
    echo "tsc checked none of the mod's files: the config is wrong, not the code"
    failed=1
  elif [ "$tsc_exit" -ne 0 ]; then
    failed=1
  else
    echo "tsc ok ($checked mod files checked)"
  fi
fi

echo "== test"
if find "$mod" -path "$mod/node_modules" -prune -o -name '*.test.ts*' -print | grep -q .; then
  claude plugin test "$mod" >"$tmp/test.log" 2>&1
  test_exit=$?
  grep -E '^\(fail\)|^ *[0-9]+ (pass|fail)$|Error' "$tmp/test.log"
  [ "$test_exit" -ne 0 ] && failed=1
else
  echo "no tests found: every mod needs at least one *.test.ts"
  failed=1
fi

if [ "$failed" -eq 0 ]; then echo "== PASS"; else echo "== FAIL"; fi
exit "$failed"
