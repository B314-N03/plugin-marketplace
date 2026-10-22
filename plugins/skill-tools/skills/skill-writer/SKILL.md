---
name: skill-writer
description: Guide users through creating Agent Skills for Claude Code. Use when the user wants to create, write, author, or design a new Skill, or needs help with SKILL.md files, frontmatter, or skill structure.
---

# Skill Writer

Create well-structured Claude Code skills that follow best practices and validation requirements.

## Instructions

### Step 1: Determine Scope

Clarify the skill's purpose:

1. What specific capability should it provide?
2. When should Claude use it?
3. What tools or resources does it need?
4. Personal (`~/.claude/skills/`), project (`.claude/skills/`), or a plugin in the marketplace repo (`~/Coding/plugin-marketplace/plugins/<plugin>/skills/`)?
5. Will it ever run outside Claude Code — claude.ai, the Skills API, Cowork, cloud sessions, or routines? If so, § "Portability" in the authoring guide constrains the frontmatter.

**Overlap check**: Scan existing skills in `.claude/skills/` and `~/.claude/skills/` for skills with overlapping descriptions. If a match exists, suggest extending the existing skill instead of creating a new one. See `reference/skill-authoring-guide.md` § "Input Validation" for when to push back.

**Update vs. create**: If the user wants to update an existing skill, read it first and follow § "Updating Existing Skills" in the authoring guide — including the step adjustments table.

### Step 2: Create Structure

Check if the target directory already exists. If it does, ask the user: update the existing skill or create under a different name.

For new skills, create the directory. For directory patterns (single-file vs. multi-file), see `reference/skill-authoring-guide.md` § "Directory Patterns".

### Step 3: Write Frontmatter

Write YAML frontmatter. Keep `name` identical to the directory name — the directory is what sets the `/command`. `name` must not contain `anthropic` or `claude`.

For field rules (`name`, `description`) and optional fields (`when_to_use`, `allowed-tools`, `disallowed-tools`, `disable-model-invocation`, `user-invocable`, `context`, `agent`, `background`, `model`, `effort`, `paths`, `arguments`, `argument-hint`, `shell`, `hooks`, `metadata`, `license`, `compatibility`), see `reference/skill-authoring-guide.md` § "Frontmatter Fields" and the Decision Guide table.

`allowed-tools` **pre-approves** tools for the invoking turn — it does not restrict anything. Use `disallowed-tools` to remove a tool from the pool.

If the skill will ever be uploaded to claude.ai, used via the Skills API, or packaged, restrict frontmatter to the six spec fields now — see § "Portability" in the guide. A non-spec field is a hard packaging error, not an ignored key.

### Step 4: Write Content

Structure the skill body using the template from `templates/skill-template.md`. For skills with substantial domain knowledge, extract reference material into `reference/` files and keep SKILL.md focused on orchestration.

Two rules that shape the writing: match the freedom level to the task's fragility (exact commands for fragile sequences, heuristics for open judgment), and phrase anything that should hold for the whole task as a **standing rule** — skill content persists in context but is never re-read, so a one-time step reads as already done. See § "Core Principles" and § "Skill Content Lifecycle" in the guide.

### Step 5: Add Supporting Files

For guidance on when to create `reference/`, `templates/`, `scripts/`, or `examples/` directories, see `reference/skill-authoring-guide.md` § "Directory Patterns". Reference all supporting files from SKILL.md with relative paths.

### Step 6: Build Evaluations

Before declaring the skill done, write 3 eval scenarios per `reference/validation-criteria.md` § "Evaluation": the canonical trigger, an ambiguous trigger that doesn't include the skill name, and an adjacent-but-wrong query the skill should NOT activate on. Run each across Haiku, Sonnet, and Opus.

### Step 7: Validate & Test

Run the checklist from `reference/validation-criteria.md` § "Validation Checklist", then follow § "Testing" and § "Troubleshooting" to verify the skill activates correctly. If the skill will leave Claude Code, also run § "Distribution Check".

## Failure Handling

See `reference/validation-criteria.md` § "Failure Handling".

## Output Format

Render the final report using the format from `templates/skill-output.md`.

## Notes

- Read existing skills in the project for style reference before creating
- For common skill archetypes, see `reference/skill-authoring-guide.md` § "Common Archetypes"
- For multi-step procedures, use the checklist and validator-loop patterns in § "Workflows and Feedback Loops"
- Canonical reference skills live at [github.com/anthropics/skills](https://github.com/anthropics/skills)
- Keep SKILL.md under 500 lines and put load-bearing instructions near the top — see § "Skill Content Lifecycle" in the authoring guide for why
- Only add what Claude doesn't already know; cut any paragraph that doesn't justify its token cost

