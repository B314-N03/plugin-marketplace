# Validation Criteria

Checklists, troubleshooting, and failure handling for skill creation and updates.

## Table of Contents

- Validation Checklist (file structure, frontmatter, content quality, activation)
- Distribution Check
- Evaluation
- Testing
- Troubleshooting
- Failure Handling

## Validation Checklist

Run after creating or updating a skill.

### File Structure

- [ ] SKILL.md exists in correct location (personal or project)
- [ ] Directory name matches frontmatter `name` — the directory is what sets the `/command`; `name` is only the display label (except in plugin skills, where it sets the command's last segment)
- [ ] Supporting files (if any) are referenced from SKILL.md, with a note on what each contains
- [ ] Supporting file names describe their contents (`form_validation_rules.md`, not `doc2.md`)

### YAML Frontmatter

- [ ] Opening `---` on line 1
- [ ] Closing `---` before content
- [ ] Valid YAML (no tabs, correct indentation)
- [ ] `name`: lowercase, hyphens only, max 64 chars; contains neither `anthropic` nor `claude`; no XML tags
- [ ] `description`: specific, ≤ 1,024 chars, includes "what" + "when", third person, no XML tags, key use case first
- [ ] `when_to_use` (if present): combined length with `description` ≤ 1,536 chars
- [ ] `allowed-tools` (if present): space-separated, comma-separated, or YAML list — all valid; `Bash(...)` patterns scoped narrowly, not blanket `Bash`
- [ ] `allowed-tools` is not being relied on to *restrict* anything — it only pre-approves. Use `disallowed-tools` to remove tools
- [ ] `arguments` (if present): space-separated string or YAML list of **names**, not a list of objects
- [ ] `disable-model-invocation: true` on any destructive or irreversible workflow (deploy, commit, send, delete)
- [ ] `agent` (if present, with `context: fork`): names a subagent type this session actually offers
- [ ] No undocumented fields (e.g. a bare `version:` — put custom keys under `metadata:`)

### Content Quality

- [ ] Instructions are step-by-step and actionable
- [ ] Freedom level matches task fragility — exact commands for fragile sequences, heuristics for open-ended judgment
- [ ] Standing rules are phrased as rules, not one-time steps (skill content is never re-read)
- [ ] Concrete examples provided (not pseudocode); at least one input/output pair
- [ ] Edge cases addressed; expected failures handled in scripts rather than deferred to Claude
- [ ] Dependencies listed with install commands (if any)
- [ ] MCP tools referenced as `ServerName:tool_name`
- [ ] Consistent terminology throughout (one word per concept)
- [ ] File paths use forward slashes (no Windows `\`)
- [ ] No time-sensitive content — current rule in the body, history in an "Old patterns" `<details>` block
- [ ] SKILL.md under 500 lines
- [ ] Load-bearing instructions in the first ~5K tokens
- [ ] Reference files over ~100 lines have a Table of Contents
- [ ] References are one level deep from SKILL.md
- [ ] One default approach per task (no "use A, B, or C" without picking one)
- [ ] No magic numbers — every constant justified in a comment

### Activation

- [ ] Description matches user questions that should trigger the skill
- [ ] Description includes specific trigger words and file types
- [ ] No ambiguous overlap with existing skills

## Distribution Check

Only if the skill will leave Claude Code — claude.ai upload, the Skills API, or `package_skill.py`:

- [ ] Frontmatter limited to `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` — any other field is a hard packaging error, not an ignored key
- [ ] No Claude Code-only body features (`$ARGUMENTS`, dynamic context injection) that would silently do nothing
- [ ] For a personal skill needed in Cowork, cloud sessions, or routines: enabled on claude.ai or committed to the repo's `.claude/skills/` — those sessions never read `~/.claude/skills/`

## Evaluation

Build evals **before** writing extensive skill content, so it addresses observed gaps rather than imagined ones. Minimum: 3 scenarios, measured against a no-skill baseline.

Each scenario takes the shape from the official docs:

```json
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF",
  "files": ["test.pdf"],
  "expected_behavior": ["Reads PDF", "Extracts all pages", "Saves to output.txt"]
}
```

There is no built-in runner — this is a rubric you execute yourself.

Recommended scenario coverage:

1. **Most common trigger** — the canonical use case the skill exists for.
2. **Ambiguous trigger** — a phrasing that doesn't include the skill's name, to verify activation isn't relying on the exact word.
3. **Adjacent-but-wrong** — a request that *looks* similar but the skill should NOT activate, to check for false positives.

**Run across models.** Haiku, Sonnet, and Opus follow instructions differently — Haiku may need more guidance than Opus needs. Run each scenario on every model the skill is likely to be invoked from.

## Testing

1. **Save the skill** — Claude Code watches skill directories and picks up SKILL.md edits within the session. Restart only if you created a top-level skills directory that didn't exist at session start.
2. **Ask relevant questions** that match the description
3. **Verify activation**: Claude should use the skill automatically
4. **Try the most ambiguous trigger phrasing** — confirm activation doesn't depend on the exact skill name
5. **Check behavior**: Confirm Claude follows the instructions correctly across Haiku/Sonnet/Opus
6. **Watch how Claude navigates** — unexpected read order, ignored links, or a bundled file never opened all point at structural problems

## Troubleshooting

### Skill doesn't activate

- Make description more specific with trigger words
- Include file types and operations in description
- Add "Use when..." clause with user phrases
- Check `disable-model-invocation` isn't set if you expect auto-invocation
- Check `paths` isn't scoping it away from the files in play
- Confirm no higher-precedence skill shares the name (enterprise > personal > project > bundled)

### Skill activates but stops influencing behavior

- The content is usually still in context; the model is choosing other approaches. Strengthen the description and use imperative rules ("MUST filter", not "always filter")
- After compaction in a session with many skills, an older skill may have been dropped from the 25K re-attachment budget — re-invoke it
- For behavior that must be guaranteed, use hooks rather than instructions

### Multiple skills conflict

- Make descriptions more distinct
- Use different trigger words per skill
- Narrow the scope of each skill

### Skill has errors

- Check YAML syntax (no tabs, proper indentation)
- Verify file paths (use forward slashes)
- Ensure scripts have execute permissions
- List all dependencies

### Debug mode

```bash
claude --debug
```

Check file location:

```bash
ls ~/.claude/skills/skill-name/SKILL.md
ls .claude/skills/skill-name/SKILL.md
```

## Failure Handling

| Failure | Action |
|---------|--------|
| YAML frontmatter invalid | Show the parse error, fix the YAML, re-validate |
| Directory name doesn't match `name` field | Rename the directory to match — the directory sets the command, so divergence means the listing and the `/command` disagree |
| Skill doesn't activate after creation | Check description specificity, `disable-model-invocation`, `paths`, name collisions; then run debug mode |
| Target directory already exists | Check before `mkdir -p`. Ask user: update existing skill or create under a different name |
| Supporting scripts lack execute permissions | Run `chmod +x` on scripts, note in the skill's requirements section |
| Description conflicts with existing skill | Show both descriptions, ask user to disambiguate or merge |
| Skill uses non-spec frontmatter but must be uploaded/packaged | Move custom keys into `metadata:`, drop Claude Code-only fields, re-check § "Distribution Check" |
