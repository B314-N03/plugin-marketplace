# Audit Checklist

> `<skill-dir>` is this skill's base directory (the Skill tool reports it); skill-writer is its sibling in the `skill-tools` plugin.

Severity-graded checklist for auditing existing skills against current Anthropic standards.

## Table of Contents

- Source of Truth
- Critical (must fix)
- Important (should fix)
- Nice-to-have
- Audit Procedure
- Notes

## Source of Truth

This checklist is a re-organization of the rules in `skill-writer` by severity. Don't duplicate content — cite these files when justifying findings:

- Validation rules: `<skill-dir>/../skill-writer/reference/validation-criteria.md`
- Best practices and antipatterns: `<skill-dir>/../skill-writer/reference/skill-authoring-guide.md`

## Critical (must fix)

- [ ] YAML frontmatter parses cleanly (no tabs, no missing closing `---`)
- [ ] `name` contains neither `anthropic` nor `claude`, and no XML tags
- [ ] Destructive workflows (deploy, delete, commit, send, force-push) have `disable-model-invocation: true`
- [ ] `arguments` (if present) is a space-separated string or YAML list of **names** — a list of `{name, description}` objects is invalid syntax and will not substitute
- [ ] `allowed-tools` is not being relied on as a sandbox — it only pre-approves for the invoking turn; every other tool stays callable. Real restriction is `disallowed-tools`
- [ ] Scripts referenced from SKILL.md exist and are executable (`chmod +x`)
- [ ] Internal links resolve — every `reference/foo.md § Bar` points to a real file and section
- [ ] Blanket `Bash` in `allowed-tools` where scoped `Bash(cmd *)` patterns would do — in a project skill this is a real grant to anyone who clones the repo
- [ ] If the skill is distributed (claude.ai upload, Skills API, `package_skill.py`, Cowork/cloud/routines): frontmatter limited to `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` — anything else fails packaging outright

## Important (should fix)

- [ ] `description` is specific (what + when + trigger words), not vague like "helps with X"
- [ ] `description` written in **third person** ("Processes…", not "I help you with…" or "You can use this to…")
- [ ] `description` ≤ 1,024 chars; combined with `when_to_use` ≤ 1,536 chars, key use case first
- [ ] `name` matches the directory name — the directory sets the `/command`, so divergence makes the listing and the command disagree (plugin skills excepted: there `name` sets the command's last segment)
- [ ] No undocumented frontmatter fields — a bare `version:` belongs under `metadata:`
- [ ] `agent` (with `context: fork`) names a subagent type that actually exists
- [ ] `disallowed-tools` set on autonomous/background skills that must never prompt (e.g. `AskUserQuestion`)
- [ ] SKILL.md ≤ 500 lines
- [ ] Reference files > ~100 lines have a Table of Contents near the top
- [ ] Standing rules phrased as rules, not one-time steps — skill content persists but is never re-read
- [ ] Freedom level matches task fragility — exact commands for fragile sequences, heuristics for open judgment
- [ ] No first-person language in the skill body ("I will…", "we should…")
- [ ] No time-sensitive content ("before August 2025", "as of last week", "currently…") — history belongs in an "Old patterns" `<details>` block
- [ ] Consistent terminology — one word per concept, not "field"/"box"/"element" interchangeably
- [ ] MCP tools referenced as `ServerName:tool_name`, not bare tool names
- [ ] Dependencies named with install commands, not assumed present
- [ ] At least one input/output example for the main flow
- [ ] One default approach per task (not "use A, B, or C" without picking one)
- [ ] No deeply nested links — SKILL → ref → details → answer is one hop too many
- [ ] No Windows-style paths (`reference\foo.md`) — use `/`
- [ ] Scripts handle expected failures instead of deferring to Claude; no unexplained magic numbers

## Nice-to-have

- [ ] `when_to_use` separated from `description` for cleaner discovery metadata
- [ ] `paths` set if the skill is file-type specific (`**/*.tsx`, `**/*.test.ts`)
- [ ] `model` / `effort` set if the skill needs a non-default
- [ ] `background: false` if a forked skill's result is needed in the invoking turn
- [ ] Most load-bearing instructions in the first ~5K tokens of SKILL.md (compaction re-attaches the top of each invoked skill first, within a 25K shared budget)
- [ ] Multi-step procedures use a copy-able progress checklist
- [ ] Quality-critical steps have a validator loop (run → fix → repeat → only then proceed)
- [ ] Batch or destructive operations use plan → validate → execute with a verifiable intermediate file
- [ ] Three eval scenarios documented (canonical, ambiguous, adjacent-but-wrong), run across Haiku/Sonnet/Opus
- [ ] Domain knowledge in `reference/`, output formats in `templates/`, executable helpers in `scripts/`
- [ ] Supporting files named for their contents (`form_validation_rules.md`, not `doc2.md`)
- [ ] Script usage states execute-vs-read intent ("Run X" vs. "See X for the algorithm")
- [ ] Skill name in gerund form (`processing-pdfs`) or noun phrase (`pdf-processing`), not generic (`helper`, `utils`)
- [ ] No content Claude already knows — every paragraph justifies its token cost

## Audit Procedure

1. Read SKILL.md and all supporting files; record line counts.
2. Walk the checklist top-down. Stop and capture each ❌.
3. For every finding record: severity, file:line, current text, proposed text, justification (cite the standard).
4. Group findings by severity in the report.

## Notes

- A skill that passes the **Critical** section but fails several **Important** items is functional but degraded — apply important fixes by default unless the user opts out.
- A skill with only **Nice-to-have** findings is healthy. Don't manufacture work.
- `allowed-tools` accepts space-separated, comma-separated, **and** YAML list forms. All three are current. Never flag comma-separated as legacy.
