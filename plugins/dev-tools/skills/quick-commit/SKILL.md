---
name: quick-commit
description: Create a well-structured git commit with conventional commit format. Use when the user says "commit", "quick commit", "save changes", or wants to commit staged or unstaged changes.
---

# Quick Commit

Create a well-formed git commit following conventional commit standards.

## Arguments

- `$ARGUMENTS`: Optional commit scope or hint (e.g., "fix login bug", "feat auth"). If empty, auto-detect from changes.

## Instructions

### Step 1: Assess current state

Run in parallel:
```bash
git status
git diff --stat
git diff --cached --stat
git log --oneline -5
```

### Step 2: Analyze changes

- Read the diff to understand what changed and why
- If nothing is staged, identify logical groups of changes
- If the user provided a hint in $ARGUMENTS, use it to guide the commit message

### Step 3: Stage files if needed

- If nothing is staged, suggest which files to stage
- Stage related changes together - don't mix unrelated changes
- Never stage `.env`, credentials, or large binary files
- Prefer `git add <specific files>` over `git add .`

### Step 4: Write commit message

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types**: feat, fix, refactor, test, docs, style, chore, perf, ci, build
**Scope**: Component, module, or area affected (optional but preferred)
**Description**: Imperative mood, lowercase, no period, max 72 chars

### Step 5: Commit

Use a HEREDOC for the message to preserve formatting:
```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body explaining why, not what.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Step 6: Verify

```bash
git log -1 --stat
```

## Rules

- NEVER amend existing commits unless explicitly asked
- NEVER force push
- NEVER skip pre-commit hooks
- If pre-commit hook fails, fix the issue and create a NEW commit
- Keep commits atomic: one logical change per commit
