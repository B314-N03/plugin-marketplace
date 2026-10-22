---
name: skill-refactor
description: Audit and refactor existing Claude Code skills to match current Anthropic standards. Modernizes outdated frontmatter, splits oversized SKILL.md, fixes vague or first-person descriptions, removes time-sensitive language, corrects tool-permission fields, and adds when_to_use.
when_to_use: When the user says "audit this skill", "modernize this skill", "refactor skill", "skill review", "is this skill following best practices", "bring this skill up to current standards", or asks for a compliance pass on an existing skill.
allowed-tools: Read Edit Write Glob Grep WebFetch WebSearch Bash(find *) Bash(ls *) Bash(wc *) Bash(mkdir *) Bash(mv *)
---

# Skill Refactor

Audit a Claude Code skill against current Anthropic standards, propose a severity-graded diff, and apply approved changes.

## Arguments

- `$ARGUMENTS`: path to a skill (directory or `SKILL.md`). If omitted, list available skills and ask.

## When to use this vs. `skill-writer`

- **`skill-writer` § "Updating Existing Skills"** — targeted, user-driven changes ("add a new step that does X", "rename this skill").
- **This skill** — a full standards-compliance sweep against the current best-practices doc, regardless of what the user thinks needs changing.

If the user only wants a single targeted change, hand off to `skill-writer`.

## Instructions

### Step 1: Locate the target skill

Resolve `$ARGUMENTS` to a skill directory:

1. If `$ARGUMENTS` is empty, list `~/.claude/skills/`, `.claude/skills/` (if present) and the skills in your plugin marketplace repo (`~/Coding/plugin-marketplace/plugins/*/skills/`) and ask which to audit.
2. Accept a directory name, an absolute path, or a path to `SKILL.md`.
3. Confirm the directory contains a `SKILL.md`. If not, stop and tell the user.

**Meta case**: if the target resolves to `skill-writer` itself, switch to `reference/meta-audit.md` — the standard flow is circular for that target because `skill-refactor`'s checklist *cites* `skill-writer`. The meta procedure researches current Anthropic docs first, updates `skill-writer`, then cascades into this skill's own checklist and migration files.

### Step 2: Read the skill in full

Read `SKILL.md` and every file under `reference/`, `templates/`, `scripts/`, `examples/` (if present). Record line counts — the audit needs them.

### Step 3: Run the audit

Walk the severity-graded checklist in `reference/audit-checklist.md`. The authoritative rules live in `skill-writer`:

- `${CLAUDE_SKILL_DIR}/../skill-writer/reference/validation-criteria.md` (validation + content quality)
- `${CLAUDE_SKILL_DIR}/../skill-writer/reference/skill-authoring-guide.md` § "Common Mistakes"

Severity rubric:

- **Critical** — blocks correct activation or creates risk (broken YAML, reserved word in `name`, invalid `arguments` syntax, destructive skill missing `disable-model-invocation`, broken internal links, blanket `Bash` pre-approval, non-spec frontmatter on a distributed skill).
- **Important** — degrades quality (vague description, first-person, name/dir mismatch, oversized SKILL.md, undocumented fields, one-time phrasing for standing rules, unqualified MCP names, no examples, time-sensitive content, Windows paths).
- **Nice-to-have** — polish (missing `when_to_use`, no ToC in long reference files, no `paths` for file-typed skills, no checklist or validator loop on a fragile workflow, no eval scenarios).

`allowed-tools` pre-approves; it does not restrict. Comma-separated lists are valid syntax. Never raise either as a finding — see `reference/audit-checklist.md` § Notes.

For each finding, capture: severity, location (`SKILL.md:14`), current text (quoted), proposed text (quoted), justification (cite the standard).

### Step 4: Propose the diff

Render the audit report from `templates/audit-report.md`. Show the full diff before changing anything.

For mechanical conversions (`allowed-tools` misuse → `disallowed-tools`, invalid `arguments` objects, `version:` → `metadata:`, first-person → third-person, oversized SKILL.md splits, etc.), use the recipes in `reference/migration-patterns.md`.

### Step 5: Confirm before applying

Ask which findings to apply. Default: all **critical** + **important**. Nice-to-have items are opt-in. Do NOT modify any file until the user confirms.

### Step 6: Apply changes

Apply edits with `Edit`. For SKILL.md splits or new reference files, use `Write`. For directory renames, ask the user twice — renames break muscle memory and `/skill-name` invocation.

Preserve any section the user did not approve changing.

### Step 7: Re-validate

Re-run the validation checklist from `${CLAUDE_SKILL_DIR}/../skill-writer/reference/validation-criteria.md` against the modified skill. List any findings that remain unresolved (e.g., the user declined to fix a critical item).

## Failure Handling

| Failure | Action |
|---------|--------|
| Path is not a skill (no SKILL.md) | Stop and report the path |
| Frontmatter YAML currently broken | Fix YAML first as a critical finding before any other change |
| User declines a critical finding | Apply the rest; flag the unresolved critical at the top of the final report |
| Refactor would rename the skill | Ask twice — renames break `/skill-name` invocation and muscle memory |
| Audit target is `skill-writer` itself | Switch to `reference/meta-audit.md` (researches official Anthropic docs, updates `skill-writer`, then cascades into this skill's checklist + migration files) |
| `WebFetch` of official docs returns nothing useful during meta audit | Stop. Don't fabricate standards from memory — tell the user the docs are unreachable and ask whether to retry or abort |

## Output Format

Render the report from `templates/audit-report.md`.

## Notes

- One source of truth: standards live in `skill-writer`'s reference files. This skill never duplicates them — it cites them.
- Re-running this skill on the same target should yield zero new findings if the prior pass was applied in full.
- Canonical example skills for comparison: [github.com/anthropics/skills](https://github.com/anthropics/skills).
