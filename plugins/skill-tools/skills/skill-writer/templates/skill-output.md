# Skill Writer Output Format

What the skill-writer delivers when creating or updating a skill.

---

## Deliverables

1. **Skill directory** with SKILL.md and any supporting files
2. **Validation results** — checklist run against the completed skill
3. **Testing instructions** — how to verify the skill activates correctly

## Report Format

```
## Skill Created: [skill-name]

**Location**: [personal or project path]
**Files**:
- SKILL.md ([X] lines)
- (any supporting files with line counts)

**Description**: [the frontmatter description]

**Triggers on**: [list of phrases/queries that should activate this skill]

### Validation
[checklist results — pass/fail per item]

### Evaluation
[Optional for trivial single-file skills. Otherwise: N scenarios run across Haiku/Sonnet/Opus, with pass/fail per model]

### Test It
[2-3 example queries the user can try to verify activation]
```

