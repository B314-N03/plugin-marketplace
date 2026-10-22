# Skill Authoring Guide

Reference for writing well-structured Claude Code skills — frontmatter rules, description formulas, directory patterns, and common skill archetypes.

## Table of Contents

- Core Principles
- Frontmatter Fields (required + optional)
- Decision Guide
- Portability: Claude Code vs. the Agent Skills Spec
- String Substitutions
- Directory Patterns
- Skill Location
- Naming Conventions
- Common Archetypes
- Best Practices
- Workflows and Feedback Loops
- Skill Content Lifecycle
- Evaluation-Driven Development
- Common Mistakes
- Input Validation
- Updating Existing Skills
- Canonical Examples

## Core Principles

### Assume Claude is already smart

Only add context Claude doesn't already have. Challenge every paragraph: does Claude really need this explanation, or does this just cost tokens? A skill that explains what a PDF is has failed the test.

At startup only `name` and `description` are pre-loaded. SKILL.md is read when the skill becomes relevant — and from then on it competes with conversation history for the rest of the session.

### Match the degree of freedom to the task

| Freedom | Form | Use when |
|---------|------|----------|
| **High** | Prose instructions, heuristics | Multiple approaches are valid; decisions depend on context (e.g. code review) |
| **Medium** | Pseudocode, parameterized scripts | A preferred pattern exists but variation is acceptable |
| **Low** | An exact command, no parameters | Operations are fragile; a specific sequence must be followed (e.g. DB migration) |

The analogy: an open field takes general direction, a narrow bridge takes exact guardrails. Writing low-freedom instructions for an open-field task makes the skill brittle; writing high-freedom instructions for a narrow bridge gets things broken.

### Test across models

A skill that works on Opus may be ignored or misread by Haiku. Ask per model: does Haiku get *enough* guidance, is Sonnet's path clear and efficient, does Opus get *over*-explained? Run the skill on every model it will be invoked from.

## Frontmatter Fields

In Claude Code every field is technically optional — `name` defaults to the directory name and `description` falls back to the first paragraph of the body. Treat `name` and `description` as required anyway: `description` is what Claude matches against when choosing among 100+ skills, and an implicit one is never as good.

Boolean fields accept `true`/`false` plus `yes`, `no`, `on`, `off`, `1`, `0` in any case.

### Required in practice

#### `name`

- Lowercase letters, numbers, hyphens only (no caps, no underscores)
- Max 64 characters
- Must not **contain** the reserved words `anthropic` or `claude`
- No XML tags
- Keep it identical to the directory name

The directory-name rule is a convention, not a validator. In personal and project skills, `name` sets only the **display label** in skill listings — the `/command` you type comes from the directory name. Only in **plugin** skills does `name` set the last segment of the command (`my-plugin/skills/review/` with `name: fancy` → `/my-plugin:fancy`). Diverging the two in a personal skill produces a skill whose listing says one thing and whose command is another. Don't.

- Good: `pdf-processor`, `processing-pdfs`, `git-commit-helper`
- Bad: `PDF_Processor`, `Git Commits!`, `claude-helper`, `my-anthropic-tools`

#### `description`

- Max 1,024 characters; house guidance (not an official rule) is to aim for **150–250 chars**
- Combined `description + when_to_use` is truncated at **1,536 chars** in the skill listing — put the key use case first
- Write in **third person** ("Processes Excel files", not "I help you with…" and not "You can use this to…"). The description is injected into the system prompt; mixed point-of-view degrades discovery.
- No XML tags
- Formula: **what it does** + **when to use it** + **trigger words**
- Include specific file extensions (.pdf, .xlsx, .json) and concrete operations
- Mention common user phrases ("analyze", "extract", "generate")

Good:

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

Bad:

```yaml
description: Helps with documents
description: For data analysis
```

### Optional

#### `when_to_use`

Separate trigger guidance from the description. Appended to `description` for matching, but lets `description` stay a clean noun-phrase summary.

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
when_to_use: When the user mentions PDFs, forms, document extraction, or has a .pdf file open.
```

Combined length with `description` must stay under **1,536 chars**.

#### `allowed-tools`

**Pre-approval, not restriction.** Lists tools Claude may use *without a permission prompt* during the turn that invokes the skill. Every other tool remains callable — normal permission settings still apply to them. The grant clears when the user sends the next message, even though the skill content stays in context; re-invoking re-applies it.

Accepts a space-separated string, a comma-separated string, or a YAML list — all three are valid.

```yaml
allowed-tools: Read Grep Bash(git add *) Bash(git commit *)
```

```yaml
allowed-tools:
  - Read
  - Grep
  - Bash(git add *)
```

Granular `Bash(command *)` patterns scope which shell commands are pre-approved. Keep them narrow: a project skill's `allowed-tools` takes effect once the workspace trust dialog is accepted, so a broad grant is a real risk in a repo you didn't write.

To pre-approve a script bundled with the skill, use `${CLAUDE_SKILL_DIR}` in both the rule and the body so they match exactly — see § "String Substitutions".

#### `disallowed-tools`

**This is the restriction field.** Removes tools from Claude's available pool while the skill is active. Use for autonomous skills that must never call something — e.g. `AskUserQuestion` in a background loop.

```yaml
disallowed-tools: AskUserQuestion WebFetch
```

Same three syntaxes as `allowed-tools`. The restriction clears on the next user message. It cannot remove `EndConversation` while any other tool remains.

#### `disable-model-invocation`

Prevents Claude from auto-invoking the skill — only the user can trigger it via `/skill-name`. Use for destructive or irreversible workflows (deploy, commit, send, delete). It also stops the skill being preloaded into subagents, and stops it running when a scheduled task fires with the skill as its prompt.

```yaml
disable-model-invocation: true
```

#### `user-invocable`

Set to `false` to hide the skill from the `/` menu — background knowledge, auto-applied conventions, coding standards. Claude can still load it; the user cannot type it.

```yaml
user-invocable: false
```

#### `context`, `agent`, and `background`

Run the skill in a forked subagent context. Useful for skills that produce large output or need a clean window.

```yaml
context: fork
agent: Explore
background: false
```

- `context: fork` is the only value.
- `agent` names the subagent type to fork into — any type available in the session (`Explore`, `Plan`, `general-purpose`, or a custom agent). There is no fixed list; check what the session actually offers.
- `background` only applies with `context: fork`. Default `true` (runs in the background). Set `false` to wait for the subagent's result within the invoking turn.

#### `model`

Model to use while the skill is active. Accepts the same values as `/model`, or `inherit` to keep the session model. The override lasts for the rest of the turn and is not saved to settings.

```yaml
model: claude-haiku-4-5
```

#### `effort`

Override the effort level: `low`, `medium`, `high`, `xhigh`, `max`. Available levels depend on the model.

```yaml
effort: high
```

#### `paths`

Glob patterns limiting automatic activation to work touching matching files. Accepts a comma-separated string or a YAML list.

```yaml
paths:
  - "**/*.tsx"
  - "**/*.test.ts"
```

#### `arguments` and `argument-hint`

For user-invoked skills (`/skill-name foo bar`):

```yaml
argument-hint: "[issue-number] [branch]"
arguments: issue branch
```

`arguments` is a **space-separated string or YAML list of names** — not a list of objects. Names map to argument positions in order, so `$issue` expands to the first argument and `$branch` to the second. `argument-hint` is display-only, shown during autocomplete.

#### `shell`

`bash` (default) or `powershell` — the shell used for `` !`command` `` injection blocks in this skill.

```yaml
shell: powershell
```

#### `hooks`

Lifecycle hooks scoped to this skill. Same shape as the global hooks config.

#### `metadata`

Free-form YAML map for your own tooling (entitlements, catalog fields, version stamps). Claude Code doesn't act on it and drops any value that isn't a map. Don't reuse real frontmatter field names as keys.

```yaml
metadata:
  version: 1.2.0
  owner: platform-team
```

#### `license` and `compatibility`

Part of the [Agent Skills](https://agentskills.io) spec. Claude Code accepts both but doesn't act on them. `compatibility` is a string up to 500 chars describing environment requirements.

```yaml
license: MIT
compatibility: Requires Python 3.11 and the pdfplumber package.
```

## Decision Guide

| Scenario | Frontmatter |
|----------|-------------|
| Skill needs specific tools without permission prompts | `allowed-tools: Read Grep Glob` |
| Skill must never call a tool (autonomous loops) | `disallowed-tools: AskUserQuestion` |
| Destructive action (deploy, delete, commit) | `disable-model-invocation: true` |
| Background convention / auto-applied rules | `user-invocable: false` |
| Heavy analysis with large output | `context: fork` + `agent: Explore` |
| Forked skill whose result the turn needs | `context: fork` + `background: false` |
| Cheap, high-volume helper | `model: claude-haiku-4-5` |
| Hard reasoning task | `effort: high` |
| Activates only on certain file types | `paths: ["**/*.tsx"]` |
| Takes positional arguments (`/skill foo`) | `arguments` + `argument-hint` |
| Will be distributed outside Claude Code | Spec fields only — see § "Portability" |
| Default interactive workflow | `name` + `description` only |

Note that `allowed-tools` does **not** lock a skill down. A "read-only skill" is read-only because its instructions say so, not because of frontmatter.

## Portability: Claude Code vs. the Agent Skills Spec

Claude Code accepts every field above. Everything else accepts only six:

| Distribution path | Allowed fields |
|-------------------|----------------|
| Claude Code skills at any level, including plugin skills | All fields |
| claude.ai uploads, the Skills API, `package_skill.py` from [anthropics/skills](https://github.com/anthropics/skills) | `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` |

An unsupported field is a **hard error**, not a silently ignored key:

```
Unexpected key(s) in SKILL.md frontmatter: argument-hint. Allowed properties are: allowed-tools, compatibility, description, license, metadata, name
```

Claude Code-only body features — dynamic context injection, `$ARGUMENTS` substitution — also don't function in claude.ai chat or through the API. If a skill will ever be uploaded or packaged, restrict its frontmatter to the six spec fields from the start; spec-conformant frontmatter loads in Claude Code unchanged.

This matters for personal skills too: Cowork sessions, cloud sessions, and routines don't read `~/.claude/skills/` — enabling a personal skill there means uploading it to claude.ai, so the six-field rule applies.

## String Substitutions

Available in the skill body (and, for the two directory variables, in `allowed-tools` Bash rules):

| Variable | Expands to |
|----------|------------|
| `$ARGUMENTS` | All arguments as typed. If absent from the body, Claude Code appends `ARGUMENTS: <value>` instead. |
| `$ARGUMENTS[N]` / `$N` | One argument by 0-based index (`$0` is the first). Shell-style quoting, so `"hello world"` is one argument. |
| `$name` | A name declared in `arguments`, mapped by position. Expands to empty string when unmatched. |
| `${CLAUDE_SESSION_ID}` | Current session ID — useful for per-session log files. |
| `${CLAUDE_EFFORT}` | `low`/`medium`/`high`/`xhigh`/`max`. Adapt instructions to the active effort. |
| `${CLAUDE_SKILL_DIR}` | The directory holding this `SKILL.md`, regardless of cwd. |
| `${CLAUDE_PROJECT_DIR}` | The project root. |

An indexed placeholder with no matching argument (`$2` when one was passed) stays literal. Escape a literal `$` before a digit or name with a backslash: `\$1.00`.

**Prompt-free bundled scripts** — use `${CLAUDE_SKILL_DIR}` in both places so the permission rule matches the command exactly:

```yaml
---
name: render-chart
description: Render a chart from a CSV file
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
---

Run `${CLAUDE_SKILL_DIR}/scripts/render.sh <csv-file>` to render the chart.
```

## Directory Patterns

### Single-file skill

```
skill-name/
└── SKILL.md
```

### Multi-file skill (progressive disclosure)

```
skill-name/
├── SKILL.md          (orchestration — kept short)
├── reference/
│   └── *.md          (domain knowledge, checklists, criteria)
├── templates/
│   └── *.md          (output formats, boilerplate)
└── scripts/
    └── *.{sh,py,js}  (executable helpers — not loaded into context)
```

Reference supporting files from SKILL.md, saying what each contains and when to load it:

```markdown
For detailed rules, read [reference/skill-authoring-guide.md](reference/skill-authoring-guide.md).
Use the template from [templates/skill-template.md](templates/skill-template.md).
```

Three layouts Anthropic recommends:

1. **High-level overview** — SKILL.md links to a few topical files (FORMS.md, REFERENCE.md, EXAMPLES.md), one level deep.
2. **Domain organization** — split reference by domain (`reference/finance.md`, `reference/sales.md`) so a question about sales never loads the finance schema.
3. **Conditional details** — link advanced features separately (REDLINING.md, OOXML.md) so they only load when relevant.

Name files for their contents (`form_validation_rules.md`, not `doc2.md`) — Claude navigates the directory like a filesystem and picks files by name.

## Skill Location

| Location | Path | Applies to |
|----------|------|------------|
| Enterprise | Managed settings | Everyone in the organization |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only (committed to git) |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Wherever the plugin is enabled |

**Precedence**: enterprise overrides personal, personal overrides project, and any of them overrides a bundled skill of the same name. Plugin skills are namespaced `plugin-name:skill-name` and can't collide.

**Discovery**: project skills load from `.claude/skills/` in the starting directory and every parent up to the repo root. Directories passed with `--add-dir` / `/add-dir` also contribute their `.claude/skills/` — the one configuration exception to that flag. Skills in *nested* `.claude/skills/` below the start directory load lazily, the first time Claude touches a file in that subtree, and appear under a directory-qualified name (`apps/web:deploy`) when the name clashes.

Skill directories may be symlinks; Claude Code follows them and loads the target once. Files in `.claude/commands/*.md` are the same mechanism as skills and support the same frontmatter — a skill wins if both exist under one name.

**Cowork and cloud sessions** (including routines) do not read `~/.claude/skills/`. Enable the skill for your claude.ai account, or commit it to the repository's `.claude/skills/`.

## Naming Conventions

- Prefer **gerund** form (`processing-pdfs`, `analyzing-spreadsheets`) or **noun phrase** (`pdf-processing`, `spreadsheet-analyzer`).
- Avoid generic names: `helper`, `utils`, `tools`, `assistant`, `documents`, `data`, `files`.
- Never use `anthropic` or `claude` anywhere in the name.
- Lowercase, hyphens only. No caps, no underscores, no spaces.
- Stay consistent within a skill collection — mixed patterns make skills hard to recall and reference.

## Common Archetypes

### Read-only skill

```yaml
---
name: code-reader
description: Read and analyze code without making changes. Use for code review, understanding codebases, or documentation.
allowed-tools: Read Grep Glob
---
```

The frontmatter pre-approves the tools it needs; the *body* is what keeps it read-only.

### Script-based skill

````markdown
---
name: data-processor
description: Process CSV and JSON data files with Python scripts. Use when analyzing data files or transforming datasets.
allowed-tools: Bash(python ${CLAUDE_SKILL_DIR}/scripts/*)
---

# Data Processor

Requires: Python 3.11, pandas.

## Instructions

1. Run the processing script:
   ```bash
   python scripts/process.py input.csv --output results.json
   ```
2. Validate output with:
   ```bash
   python scripts/validate.py results.json
   ```
3. If validation reports errors, fix the input mapping and repeat step 1.
````

### Multi-file skill with progressive disclosure

```markdown
---
name: api-designer
description: Design REST APIs following best practices. Use when creating API endpoints, designing routes, or planning API architecture.
---

# API Designer

Quick start: See [examples.md](examples.md)
Detailed reference: See [reference.md](reference.md)

## Instructions

1. Gather requirements
2. Design endpoints (see examples.md)
3. Document with OpenAPI spec
4. Review against best practices (see reference.md)
```

### Autonomous / background skill

```yaml
---
name: pr-babysitter
description: Poll an open PR until CI is green and all review threads resolve.
disallowed-tools: AskUserQuestion
disable-model-invocation: true
---
```

## Best Practices

1. **Write for Claude, not humans** — actionable directives, not explanatory prose.
2. **Justify every token** — if Claude already knows it, cut it.
3. **Use progressive disclosure** — keep SKILL.md focused on orchestration, push domain knowledge into `reference/` files.
4. **Keep SKILL.md under 500 lines** — Claude pays for every line for the rest of the session.
5. **Add a Table of Contents** to any reference file over ~100 lines so Claude can navigate from a partial read.
6. **Avoid deeply nested links** — SKILL.md → reference → details → answer is one hop too many. Claude may `head -100` a nested file and act on a fragment. Aim for SKILL.md → reference → answer.
7. **One skill, one purpose** — if it does two unrelated things, split it.
8. **Pick one default approach** — don't write "use pypdf, PyMuPDF, or pdf2image". Choose one and mention fallbacks in a separate section.
9. **Use consistent terminology** — pick "field" or "box" or "element" and never mix them. Same for "extract"/"pull"/"get". Consistency is parseability.
10. **State dependencies explicitly** — never assume a package is installed. Name the install command. Note that claude.ai can install from npm/PyPI while the Claude API has no network access at all.
11. **Prefer bundled scripts to generated code** for deterministic operations — more reliable, no generation time, and only the output costs tokens.
12. **Make execution intent explicit** — "Run `analyze_form.py` to extract fields" (execute) vs. "See `analyze_form.py` for the extraction algorithm" (read). Execution is the right default.
13. **Use visual analysis where inputs render** — convert a PDF page or a layout to an image and let Claude look at it rather than describing it in prose.

## Workflows and Feedback Loops

### Checklist workflows

For multi-step procedures, give Claude a checklist to copy into its response and tick off. It prevents silently skipped validation steps.

````markdown
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
```

**Step 1: Analyze the form**
Run: `python scripts/analyze_form.py input.pdf`
...
````

This works for pure-analysis skills too, not just script-driven ones.

### Feedback loops

The pattern that most improves output quality: **run validator → fix errors → repeat → only then proceed.**

```markdown
1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails: read the error, fix the XML, validate again
4. **Only proceed when validation passes**
5. Rebuild and test the output
```

The "validator" need not be a script — a STYLE_GUIDE.md that Claude checks its draft against is the same loop.

### Plan → validate → execute

For batch, destructive, or high-stakes operations, have Claude write its plan to a structured intermediate file, validate *that* with a script, and only then execute. Errors surface before anything is touched, the plan is cheap to iterate on, and failures point at a specific field rather than a vague symptom.

Make validation output verbose and specific: `Field 'signature_date' not found. Available fields: customer_name, order_total, signature_date_signed`.

### Conditional branches

Route explicitly at decision points rather than describing both paths at once:

```markdown
**Creating new content?** → Follow "Creation workflow" below
**Editing existing content?** → Follow "Editing workflow" below
```

If a branch grows large, move it to its own file and tell Claude which file to read.

## Skill Content Lifecycle

When a skill is invoked, its rendered SKILL.md enters the conversation as a single message and **stays there for the rest of the session**. Claude Code does not re-read the file on later turns. Two consequences:

- **Write standing instructions, not one-time steps.** Guidance that should hold for the whole task must read as a rule ("always filter test accounts"), not a step ("now filter test accounts") that has visibly already happened.
- **Permissions don't persist with the content.** An `allowed-tools` grant clears on the next user message even though the instructions remain.

Re-invoking a skill whose rendered content is identical adds only a short "already loaded" note. If arguments or injected context changed, the full content is appended again.

After auto-compaction, Claude Code re-attaches the most recent invocation of each skill, keeping the **first 5,000 tokens** of each within a shared **25,000-token** budget, filled most-recent-first. Practical implications:

- Put the most load-bearing instructions near the **top** of SKILL.md.
- Don't bury critical steps under long examples.
- For huge skills, split into multiple `reference/` files rather than one giant SKILL.md — reference files load on demand and don't compete for the re-attachment budget.
- If a skill stops influencing behavior after compaction in a session with many skills, re-invoke it.

If a skill seems to stop working *within* a session, the content is usually still present and the model is simply choosing other approaches — strengthen the `description` and instructions, or enforce the behavior with hooks.

## Evaluation-Driven Development

Build evaluations **before** writing extensive documentation, so the skill solves observed problems rather than imagined ones:

1. **Identify gaps** — run Claude on representative tasks with no skill; document the specific failures.
2. **Create evaluations** — three scenarios targeting those gaps.
3. **Establish a baseline** — measure performance without the skill.
4. **Write minimal instructions** — just enough to close the gaps.
5. **Iterate** — re-run, compare to baseline, refine. Don't add instructions that don't move a pass rate.

Each scenario captures the trigger query, any input files, and expected behavior:

```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF",
  "files": ["test.pdf"],
  "expected_behavior": ["Reads PDF", "Extracts all pages", "Saves to output.txt"]
}
```

There is no built-in runner for these — they're a rubric you execute yourself.

**Test across models.** Haiku, Sonnet, and Opus follow instructions differently. Run the same eval set against each model the skill will be invoked from.

### Iterate with two Claudes

Develop the skill with one Claude ("A") and test it with a fresh instance that has the skill loaded ("B"). Watch B on real work, not test scenarios: where it struggles, what it skips, which files it never opens. Bring specifics back to A ("B forgot the test-account filter — is that rule prominent enough?"). A may respond by moving the rule higher, strengthening "always" to "MUST", or restructuring the workflow.

Signals worth acting on when observing B:

- **Unexpected read order** — the structure isn't as intuitive as you thought.
- **Missed references** — links need to be more explicit or prominent.
- **The same file read repeatedly** — that content probably belongs in SKILL.md.
- **A bundled file never opened** — it's unnecessary, or badly signposted.

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Mega-skill covering multiple unrelated capabilities | Claude can't match a vague description to a specific request | Split into focused skills, one capability each |
| Vague description ("helps with documents") | Low activation confidence — Claude won't auto-invoke | Use the formula: what + when + trigger words |
| First-person description ("I help you with…") | Reads as marketing, not metadata; mixed POV hurts discovery | Write in third person ("Processes…", "Extracts…") |
| Treating `allowed-tools` as a sandbox | It only pre-approves; every other tool stays callable | Use `disallowed-tools` to actually remove tools |
| Unqualified MCP tool names | "Tool not found" when several servers are connected | Use `ServerName:tool_name`, e.g. `BigQuery:bigquery_schema` |
| Non-spec frontmatter on a skill you'll distribute | Packaging/upload fails hard on the unexpected key | Restrict to the six spec fields — see § Portability |
| One-time phrasing for standing rules | Content persists but is never re-read; the step reads as done | Phrase as a rule that holds for the whole task |
| Output format defined inline in SKILL.md | Bloats orchestration, hard to maintain | Extract to `templates/` |
| Domain knowledge mixed into orchestration steps | SKILL.md becomes unreadable | Extract to `reference/` files |
| Embedding full code examples in SKILL.md | Inflates line count, hides the workflow | Move to `examples/` or `reference/` |
| SKILL.md over 500 lines | Token cost for the rest of the session | Split into reference files |
| Deeply nested references (3+ levels of links) | Claude partially reads the wrong file or gives up | Flatten to SKILL → reference → answer |
| Windows-style paths (`reference\guide.md`) | Breaks on Unix | Always use `/` |
| Time-sensitive content ("before August 2025") | Goes stale silently | State the current rule; put history in an "Old patterns" `<details>` block |
| Inconsistent terminology ("field"/"box"/"element") | Harder for Claude to parse and follow | Pick one term, use it everywhere |
| No input/output examples | Claude guesses at the contract | Provide at least one concrete example pair |
| Offering too many options ("use A, B, or C") | Claude picks inconsistently | Pick one default, document fallbacks separately |
| Assuming a package is installed | Fails at runtime with no recovery path | Name the dependency and its install command |
| Magic numbers (`TIMEOUT = 47`) | Nobody can tell signal from noise | Justify every constant in a comment |
| Punting errors to Claude ("if it fails, debug it") | Wastes turns on errors the script could handle | Handle expected failure modes in the script |
| No `disable-model-invocation` on destructive skills | Claude may auto-invoke deploy/delete/commit | Add the flag for any destructive action |
| Wrong freedom level for the task | Brittle on open tasks, unsafe on fragile ones | Match specificity to fragility — see § Core Principles |

### Handling deprecated content

Rather than dating instructions, keep the current rule in the body and preserve history in a collapsed section:

```markdown
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used `api.example.com/v1/messages`. No longer supported.
</details>
```

## Input Validation

Push back on skill requests when:

- **Duplicate**: A skill with overlapping purpose already exists — suggest extending it.
- **Too broad**: The request covers multiple unrelated capabilities — split into focused skills.
- **Missing triggers**: The user can't articulate when the skill should activate — clarify before creating.
- **No clear value**: A prompt or CLAUDE.md instruction would suffice.

## Updating Existing Skills

When modifying an existing skill (not creating from scratch):

1. Read the current SKILL.md and all supporting files first.
2. Preserve existing frontmatter fields unless explicitly changing them.
3. If changing `description`, verify it still covers all existing trigger scenarios.
4. If renaming, update both the directory name and the `name` field — the directory is what changes the `/command`.
5. Run the validation checklist from `reference/validation-criteria.md` after changes.

### Step Adjustments for Updates

| Step | Create | Update |
|------|--------|--------|
| Step 1: Determine Scope | Full scoping conversation | Read existing skill first, then clarify what changes |
| Step 2: Create Structure | `mkdir -p` new directory | Skip — directory exists. If renaming, create new + migrate |
| Step 3: Write Frontmatter | Write from scratch | Preserve existing, modify only changed fields |
| Step 4: Write Content | Use template as skeleton | Edit in place, preserve sections the user didn't ask to change |
| Step 5: Add Supporting Files | Create as needed | Preserve existing files, add/modify only what's needed |
| Step 6: Build Evaluations | 3 scenarios, run baseline | Re-run existing evals + add scenarios for new behavior |
| Step 7: Validate & Test | Full checklist | Full checklist (always run after changes) |

## Canonical Examples

- **Reference repo**: [github.com/anthropics/skills](https://github.com/anthropics/skills) — Anthropic's open-source example skills.
- **Best-practices doc**: [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md).
- **Claude Code docs**: [Extend Claude with Skills](https://code.claude.com/docs/en/skills).
- **Agent Skills spec**: [agentskills.io](https://agentskills.io) — the portable subset.
