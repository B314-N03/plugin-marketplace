# Meta Audit: Refreshing `skill-writer`

> `<skill-dir>` is this skill's base directory (the Skill tool reports it); skill-writer is its sibling in the `skill-tools` plugin.

When the audit target is `skill-writer` itself, the standard flow is circular — `skill-refactor` can't measure `skill-writer` against checklists that *come from* `skill-writer`. Use this procedure instead.

## When to use this

The audit target's path resolves to `<skill-dir>/../skill-writer/` (or the project equivalent). Switch from the standard flow to this one.

## Procedure

### 1. Research current standards

Fetch the authoritative sources with `WebFetch`:

- `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md` — Skill Authoring Best Practices
- `https://code.claude.com/docs/en/skills` — Extend Claude with Skills (Claude Code docs)
- `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills` — engineering blog
- `https://github.com/anthropics/skills` — canonical example skills (README + a couple of recent skills)

Use `WebSearch` only to discover newer or moved pages — e.g. "Anthropic agent skills changelog".

Capture findings on:

- Frontmatter fields (added / changed / removed since `skill-writer`'s current reference)
- `description` guidance (length, person, formula)
- Progressive disclosure and line-count thresholds
- `allowed-tools` syntax
- Common mistakes / antipatterns
- Distribution and naming rules
- Skill content lifecycle (compaction behavior, token budgets)

### 2. Diff against `skill-writer`'s current reference

Compare findings to:

- `<skill-dir>/../skill-writer/SKILL.md`
- `<skill-dir>/../skill-writer/reference/skill-authoring-guide.md`
- `<skill-dir>/../skill-writer/reference/validation-criteria.md`
- `<skill-dir>/../skill-writer/templates/*.md`

Group:

- **New** — documented officially but missing from `skill-writer`
- **Changed** — evolved (new syntax, new threshold)
- **Stale** — present in `skill-writer` but no longer in the official docs

### 3. Propose the update

Render `templates/audit-report.md`, but the findings are *standards updates*, not compliance gaps:

- New rule → file / section to add it to
- Changed rule → quote both old and new
- Stale rule → propose deletion

Cite the source URL on every finding so the user can verify.

Show the full plan before editing.

### 4. Apply to `skill-writer`

Edit `skill-writer`'s files with the approved changes. Preserve the existing structure — keep the same section headings unless a new field requires a new heading.

### 5. Cascade to `skill-refactor`

`skill-writer` is the source of truth that `skill-refactor` cites. After updating `skill-writer`, update:

- `<skill-dir>/reference/audit-checklist.md` — add / update / remove items to reflect the new standards.
- `<skill-dir>/reference/migration-patterns.md` — add migration recipes for any old → new conversions the new standards introduce.
- `<skill-dir>/SKILL.md` — update only if orchestration practices changed (e.g. a new mandatory step).

### 6. Re-validate both

Run the (now updated) validation checklist against:

1. `skill-writer`
2. `skill-refactor`

Both should pass clean.

## Guardrails

- **Cite specific URLs** in the audit report on every finding.
- **Don't trust `skill-refactor`'s own checklist for this audit** — it would be circular. Trust the official docs instead.
- This is the only path that updates `skill-writer` via `skill-refactor`. All other audits use the standard flow in SKILL.md.
- If `WebFetch` returns nothing useful (network down, docs moved), stop and tell the user — don't fabricate standards.
