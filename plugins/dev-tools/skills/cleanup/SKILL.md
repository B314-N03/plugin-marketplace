---
name: cleanup
description: Clean up code by removing dead code, unused imports, fixing formatting, and improving consistency. Use when the user says "cleanup", "clean up", "remove unused", "dead code", "tidy up", or "lint fix".
---

# Code Cleanup

Identify and remove dead code, unused imports, and inconsistencies.

## Arguments

- `$ARGUMENTS`: File path, directory, or scope (e.g., "unused imports in src/", "dead code in auth module"). If empty, target the current working directory.

## Instructions

### Step 1: Determine scope

- Specific file: Clean that file
- Directory: Scan all source files
- Module/feature: Find related files first

### Step 2: Identify issues

Scan for these categories:

**Unused imports**
- Imports that are never referenced in the file
- Duplicate imports from the same module

**Dead code**
- Functions/methods never called from anywhere in the codebase
- Unreachable code after return/throw/break
- Commented-out code blocks (not explanatory comments)
- Variables assigned but never read
- Unused function parameters (careful - might be needed for interface compliance)

**Consistency issues**
- Mixed quote styles (single vs double)
- Inconsistent semicolons
- Mixed naming conventions in the same file
- Trailing whitespace, inconsistent line endings

**Type issues (TypeScript)**
- `any` types that could be narrowed
- Missing return types on exported functions
- Unused type definitions

### Step 3: Verify before removing

For each potential removal:
1. Search the entire codebase for references
2. Check if it's exported and might be used externally
3. Check if it's used via dynamic access (string interpolation, reflection)
4. Check git blame - recently added code might be intentionally staged

### Step 4: Apply fixes

- Make targeted edits (don't rewrite entire files)
- Group related changes
- Run linter/formatter after changes if available

### Step 5: Verify

```bash
# Run project linter
npm run lint 2>/dev/null || npx eslint . 2>/dev/null

# Run type checker
npx tsc --noEmit 2>/dev/null

# Run tests to confirm nothing broke
npm test 2>/dev/null
```

## Rules

- NEVER remove code that might be needed - when in doubt, leave it
- Don't touch generated files (*.generated.*, *.g.*, dist/, build/)
- Don't remove TODO/FIXME comments - those are intentional markers
- Don't change public API signatures unless confirmed unused
- Show what was removed so the user can review
