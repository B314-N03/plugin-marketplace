# Audit Report Template

Output format for the skill-refactor audit step.

---

```
## Skill Audit: [skill-name]

**Path**: [absolute path]
**SKILL.md**: [N lines]
**Supporting files**:
- reference/foo.md ([N] lines)
- templates/bar.md ([N] lines)

### Summary
- Critical findings: [N]
- Important findings: [N]
- Nice-to-have findings: [N]

### Findings

#### Critical

1. **[short title]** — `[file:line]`
   - Current: `[quoted current state]`
   - Proposed: `[quoted proposed state]`
   - Why: [cite validation-criteria.md § … or skill-authoring-guide.md § Common Mistakes]

#### Important

[same format]

#### Nice-to-have

[same format]

### Proposed actions

- [ ] Apply all critical (default: yes)
- [ ] Apply all important (default: yes)
- [ ] Apply nice-to-have (default: no — pick individually)

### After applying

[Re-run the validation checklist; list any findings that remain unresolved, e.g. items the user declined]
```

## Notes for the executor

- Show the report **before** any edits. Don't apply anything until the user confirms.
- For each accepted finding, apply the change with `Edit` (or `Write` for new files).
- A clean report — no critical, no important — is a valid result. Say so plainly; don't manufacture nice-to-have items just to fill space.
