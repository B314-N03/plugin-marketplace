---
name: find-bug
description: Systematically investigate and diagnose a bug or unexpected behavior. Use when the user says "find bug", "debug this", "why is this broken", "investigate error", "this doesn't work", or describes unexpected behavior.
---

# Find Bug

Systematically investigate and diagnose bugs using a structured approach.

## Arguments

- `$ARGUMENTS`: Bug description, error message, or file/component to investigate.

## Instructions

### Step 1: Gather evidence

Collect all available information:

1. **Error messages**: Read exact error output, stack traces
2. **Reproduction**: Understand when the bug occurs
3. **Expected vs actual**: What should happen vs what does happen
4. **Recent changes**: Check `git log --oneline -20` and `git diff` for recent modifications

### Step 2: Form hypotheses

Based on evidence, list 2-4 likely causes ranked by probability. Common categories:

- **State issues**: Wrong initial state, stale state, race conditions
- **Data issues**: Null/undefined values, wrong types, missing fields
- **Logic issues**: Wrong conditions, off-by-one, missing cases
- **Integration issues**: API contract mismatch, wrong parameters
- **Environment issues**: Missing env vars, wrong config, version mismatch

### Step 3: Investigate systematically

For each hypothesis (most likely first):

1. Identify the relevant code paths
2. Read the source files
3. Trace the data flow from input to where the bug manifests
4. Look for the specific condition that triggers the bug
5. Check related tests - do they cover this case?

### Step 4: Verify root cause

Before suggesting a fix:

- Can you explain WHY the bug happens, not just WHERE?
- Is this the root cause or just a symptom?
- Are there other places with the same pattern that might also be broken?

### Step 5: Propose fix

```markdown
## Bug Report

**Root Cause**: [Clear explanation of why the bug occurs]
**Location**: [file:line]
**Impact**: [What's affected]

### Fix

[Show the minimal change needed]

### Prevention

[How to prevent similar bugs: test case, type guard, validation, etc.]
```

## Rules

- Don't guess. Read the code before forming opinions.
- Follow the data flow, don't jump to conclusions.
- Check git blame if the code looks intentionally odd - there may be a reason.
- If you can't find the bug after investigation, say so clearly and suggest next steps (add logging, reproduction steps, etc.).
