# Skill Content Template

Recommended structure for SKILL.md content (frontmatter + body).

Keep SKILL.md under **500 lines**. Put the most load-bearing instructions near the top — after compaction, only the first ~5K tokens of each invoked skill are re-attached, within a 25K shared budget.

Skill content is never re-read once loaded, so anything that must hold for the whole task belongs in the body as a standing rule, not as a step that will read as already completed.

---

````markdown
---
name: skill-name
description: One-sentence noun phrase describing what the skill does, in third person. Use specific trigger words and file types.
when_to_use: Optional. Trigger guidance — when Claude should reach for this skill. Combined with description, max 1,536 chars.
---

# Skill Name

Brief overview of what this skill does.

## Requirements

Dependencies with their install commands. Omit if there are none.

## Instructions

Step-by-step guidance for Claude:

1. First step with clear action
2. Second step with expected outcome
3. Handle edge cases

## Failure Handling

How to handle common error scenarios.

## Output Format

What the skill delivers and in what format.

## Notes

- Runtime caveats the executor needs to know
- When to use vs. not use this skill
````

### Frontmatter Add-ons

Add only what the skill needs (see the guide's Decision Guide for the full table):

```yaml
disable-model-invocation: true        # destructive workflows — user-triggered only
disallowed-tools: AskUserQuestion     # removes a tool while the skill is active
allowed-tools: Read Grep Glob         # pre-approves tools; does NOT restrict
paths: ["**/*.tsx"]                   # activate only on matching files
```

For distribution outside Claude Code, only `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools` are permitted.

### Optional Sections

Add these only when the skill needs them:

- **Quick Start** — for skills with a common fast-path
- **Examples** — for skills with ambiguous steps that benefit from concrete usage
- **Workflow Checklist** — for multi-step procedures Claude should copy and tick off
- **Advanced Usage** — for skills with progressive disclosure (`reference/` files)
- **Old Patterns** — a `<details>` block for deprecated guidance, instead of dated instructions in the body
