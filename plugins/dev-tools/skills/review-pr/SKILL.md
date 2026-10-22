---
name: review-pr
description: Review a GitHub pull request for code quality, bugs, security issues, and best practices. Use when the user says "review PR", "review pull request", "check this PR", or provides a PR URL or number.
---

# Review PR

Review a GitHub Pull Request thoroughly and provide actionable feedback.

## Arguments

- `$ARGUMENTS`: PR number, URL, or branch name. If empty, review the current branch's PR.

## Instructions

### Step 1: Get PR details

```bash
# If a number or URL was provided:
gh pr view $ARGUMENTS --json title,body,files,additions,deletions,commits,baseRefName,headRefName,author,labels,reviewDecision

# If no argument, get current branch PR:
gh pr view --json title,body,files,additions,deletions,commits,baseRefName,headRefName,author,labels,reviewDecision
```

### Step 2: Get the diff

```bash
gh pr diff $ARGUMENTS
```

### Step 3: Review checklist

Analyze the PR against these criteria:

**Correctness**
- Logic errors, off-by-one bugs, null/undefined handling
- Edge cases not covered
- Race conditions or async issues

**Security**
- Injection vulnerabilities (SQL, XSS, command injection)
- Hardcoded secrets or credentials
- Unsafe deserialization, path traversal
- Missing input validation at system boundaries

**Performance**
- N+1 queries, unnecessary re-renders
- Missing memoization where expensive computation happens
- Large bundle size additions

**Code Quality**
- Naming clarity, function size
- DRY violations (actual duplication, not premature abstraction)
- Consistent patterns with codebase conventions

**Testing**
- Are new code paths tested?
- Are edge cases covered?
- Do test names describe behavior?

**Breaking Changes**
- API contract changes
- Database schema changes
- Environment variable additions

### Step 4: Read critical files

For any suspicious or complex changes, read the full files to understand context beyond the diff.

### Step 5: Output format

```markdown
## PR Review: [Title]

**Summary**: [1-2 sentence overview of what this PR does]
**Risk Level**: Low / Medium / High
**Recommendation**: Approve / Request Changes / Needs Discussion

### Critical Issues
[Blocking issues that must be fixed]

### Suggestions
[Non-blocking improvements]

### Questions
[Things that need clarification]

### Positive Notes
[Good patterns or improvements worth calling out]
```
