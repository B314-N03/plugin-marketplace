# Migration Patterns

Mechanical conversions used during refactor. Each entry pairs an old form with the current best-practice form and a short example.

## Table of Contents

- Frontmatter — `allowed-tools` misuse, `arguments` syntax, `version` → `metadata`, `agent` values, `when_to_use` split, Bash granularity, reserved names, spec-only frontmatter
- Description rewrites — first → third person, vague → specific
- Content — time-sensitive language, one-time steps, MCP names, dependencies, terminology, oversized SKILL.md, deeply nested refs, Windows paths, "choose A/B/C", magic numbers
- Structural moves — inline output formats and rules into `templates/` / `reference/`

## Frontmatter

### `allowed-tools` used as a sandbox → `disallowed-tools`

`allowed-tools` only pre-approves tools for the invoking turn; it never removes anything. A skill relying on it to stay "read-only" isn't restricted at all.

Old (intent: prevent writes):

```yaml
allowed-tools: Read Grep Glob
```

New (keep the pre-approval, add the actual restriction):

```yaml
allowed-tools: Read Grep Glob
disallowed-tools: Write Edit
```

If the intent was only "don't prompt me for these three", the original is already correct — leave it and note that read-only-ness comes from the body instructions.

### `arguments` object list → positional names

Old (invalid — will not substitute):

```yaml
arguments:
  - name: issue
    description: GitHub issue number
```

New:

```yaml
argument-hint: "[issue-number]"
arguments: issue
```

Or as a YAML list of bare names for several arguments:

```yaml
arguments:
  - issue
  - branch
```

Names map to argument positions in order, so `$issue` is the first argument and `$branch` the second. Move the discarded `description` text into `argument-hint` or the skill body.

### `version:` → `metadata:`

`version` is not a recognized frontmatter field and is not in the Agent Skills spec.

Old:

```yaml
version: 1.2.0
```

New:

```yaml
metadata:
  version: 1.2.0
```

Or drop it and use git tags.

### Invalid `agent` value

`agent` (with `context: fork`) must name a subagent type the session actually offers — `Explore`, `Plan`, `general-purpose`, or a custom agent. `Bash` is not a subagent type. Replace with the closest real type, usually `Explore` for read-heavy work.

### Add `when_to_use` to long descriptions

If `description` is over ~250 chars and contains a "Use when…" clause, split the trigger guidance into `when_to_use`.

Old:

```yaml
description: Extracts text from PDF files. Use when the user mentions PDFs, .pdf files, or document extraction.
```

New:

```yaml
description: Extracts text and tables from PDF files.
when_to_use: When the user mentions PDFs, .pdf files, or document extraction.
```

Combined length must stay under 1,536 chars, key use case first.

### Bash tool granularity

Old (broad):

```yaml
allowed-tools: Read Bash
```

New (scoped to specific commands):

```yaml
allowed-tools: Read Bash(git add *) Bash(git commit *)
```

For a bundled script, use `${CLAUDE_SKILL_DIR}` in both the rule and the body so the pre-approval matches the command exactly:

```yaml
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
```

### Reserved names

If `name` contains `anthropic` or `claude` anywhere (not just as a prefix), rename. Renames are disruptive — confirm twice, and rename the **directory** too, since that is what sets the `/command`.

### Non-spec frontmatter on a distributed skill

If the skill is uploaded to claude.ai, used via the Skills API, packaged with `package_skill.py`, or needed in Cowork/cloud/routine sessions, reduce frontmatter to the six permitted fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.

Old:

```yaml
name: deploy
description: Deploy the application
argument-hint: "[env]"
disable-model-invocation: true
```

New (spec-safe):

```yaml
name: deploy
description: Deploy the application. Pass the target environment as the first argument.
metadata:
  claude-code:
    argument-hint: "[env]"
    disable-model-invocation: true
```

Note what is lost: fields moved under `metadata` no longer take effect in Claude Code either. If the skill needs both, keep two variants rather than degrading the local one.

### Not a migration: comma-separated lists

`allowed-tools`, `disallowed-tools`, `arguments`, and `paths` all accept space-separated strings, comma-separated strings, and YAML lists. Comma-separated is **current, valid syntax** — never rewrite it as a finding.

## Description rewrites

### First-person → third-person

| First-person | Third-person |
|--------------|--------------|
| "I help you analyze…" | "Analyzes…" |
| "Use me to extract…" | "Extracts…" |
| "I'll process your…" | "Processes…" |
| "We can generate…" | "Generates…" |
| "You can use this to build…" | "Builds…" |

### Vague → specific

| Vague | Specific |
|-------|----------|
| "Helps with documents" | "Extracts text and tables from PDF and DOCX files" |
| "For data work" | "Processes CSV files and generates pivot tables in .xlsx format" |
| "General assistant" | (delete the skill or split it — too broad to activate reliably) |

## Content

### Time-sensitive language → "Old patterns" block

Preferred fix is not deletion but relocation: keep the current rule in the body and collapse the history.

Old:

```markdown
If you're doing this before August 2025, use the v1 API. After that, use v2.
```

New:

```markdown
## Current method

Use the v2 endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used `api.example.com/v1/messages`. No longer supported.
</details>
```

For phrasing with no historical value, just delete the qualifier:

| Stale | Evergreen |
|-------|-----------|
| "as of the latest version" | (cite the specific version, or remove) |
| "currently supported" | "supported" |
| "new in 2024" | (delete) |

### One-time step → standing rule

Skill content persists in context but is never re-read, so a step phrased in sequence reads as already done on later turns.

| One-time | Standing |
|----------|----------|
| "Now filter out test accounts." | "Every query MUST exclude test accounts." |
| "Start by reading the config." | "All paths resolve against the config; read it before answering path questions." |

### Unqualified MCP tool names

Old: "Use the `bigquery_schema` tool."
New: "Use the `BigQuery:bigquery_schema` tool."

Without the server prefix, lookup fails when multiple MCP servers are connected.

### Assumed dependencies

Old: "Use the pdf library to process the file."
New: "Install `pypdf` (`pip install pypdf`), then: …"

Note environment limits where relevant — claude.ai can install from npm/PyPI; the Claude API has no network access.

### Inconsistent terminology

Pick the term used most often in the skill and replace the synonyms throughout. Common offenders: field/box/element/control, extract/pull/get/retrieve, endpoint/URL/route/path.

### Oversized SKILL.md (> 500 lines)

1. Identify content blocks: domain knowledge → `reference/<topic>.md`; output formats → `templates/`; long examples → `examples/`.
2. Replace each block in SKILL.md with a one-line link stating what the file contains and when to read it.
3. Verify SKILL.md drops below 500 lines and the orchestration still reads top-to-bottom without jumps.
4. Add a Table of Contents to any new reference file over ~100 lines.
5. Check that the load-bearing instructions ended up near the top, not below the links.

### Deeply nested references

Pattern: `SKILL.md → reference/index.md → reference/topic/details.md → answer`. Flatten to: `SKILL.md → reference/topic.md → answer`. Pull the third level up; delete the index file. Nested references invite partial reads (`head -100`) and acting on fragments.

### Windows paths

Convert all `\` separators in markdown links and code references to `/`.

### "Choose A, B, or C" → one default

Old:

```markdown
Use pypdf, PyMuPDF, or pdf2image depending on what you need.
```

New:

```markdown
Use pypdf for text extraction. If pypdf fails on a malformed PDF, fall back to PyMuPDF (see reference/fallbacks.md).
```

### Magic numbers

Old:

```python
TIMEOUT = 47
```

New:

```python
# 47s = upstream API p99 latency + 5s buffer (measured 2026-04)
TIMEOUT = 47
```

Or, if the constant is arbitrary, replace it with a named, explained value.

### Errors deferred to Claude

Old: "If the script fails, debug it."
New: handle the expected failure in the script itself, with a specific message naming what was missing and what was available.

## Structural moves

### Inline output format → `templates/`

If SKILL.md has a `## Output Format` section over ~20 lines with embedded format strings, move it to `templates/<skill>-output.md` and replace the section with a one-liner pointing at the template.

### Inline domain rules → `reference/`

Same for any `## Rules` / `## Reference` section over ~30 lines. Extract to `reference/<topic>.md`, leave a pointer.

### Bare multi-step procedure → checklist + validator loop

For fragile multi-step workflows, add a copy-able progress checklist at the top of the procedure and a validation gate between steps that can fail silently:

```markdown
2. **Validate immediately**: `python scripts/validate.py out/`
3. If validation fails: read the error, fix, validate again
4. **Only proceed when validation passes**
```
