---
name: marp-deck
description: 'Generate a Marp markdown presentation on a tech topic (CVE, breach, framework release, library, AI tool, incident writeup) in one of four themes: cyber dark, light / clean, corporate blue or Nord. Researches the topic from primary sources, writes a 10–15 slide .md file, and renders it to HTML, PDF or PPTX. Use when the user asks "make a Marp deck", "build slides", "generate a presentation", "vortrag", "präsentation", or names a topic with "deck" / "slides".'
when_to_use: 'When the user wants slides about a tech topic in Marp markdown form. Skip for non-Marp formats (Keynote, reveal.js) and when the user only wants a written briefing or article (use cyber-briefing or tech-briefing instead). For new features, release highlights or version updates of a dev tool, or a deck built from given URLs, use feature-deck, which researches and then calls this skill in brief mode.'
---

# Marp Deck

Research a tech topic, write a Marp markdown deck in the theme the user picks, and render it to the formats the user picks.

## Standing rules (hold for the whole task)

- **Always ask for the theme** before composing (Step 1) unless the arguments carry `theme=<name>`. **Always ask for the output formats** after the deck is written (Step 6). Use AskUserQuestion for both; never pick silently.
- **Never hand-write CSS into a deck.** Styling comes only from `scripts/apply_theme.py`, which injects `themes/<theme>.css` + `themes/base.css` into the frontmatter. To change the look, edit the theme files, not the deck.
- **Frontmatter uses `theme: default`.** Never `uncover` or `gaia`: their built-in CSS centers code and tables, adds a footer glow and decorative quote marks, and overrides the theme files.
- **`>` is a callout, not a quote.** Use it for a definition or a one-line takeaway; it renders as a box with a colored side border.
- **Commands go in shell fences** (` ```bash `, `sh`, `shell`, `zsh` or `console`): they render as a terminal window with a red root prompt `root@<slug> #` (set by `apply_theme.py`) before the command. One command per fence (`\` continuation lines are fine), never a leading `$`, no output lines. Config files and YAML use their own language tag, not a shell tag.
- **No code inside an H1/H2 unless it is the topic's identifier**, and keep headings short: they are single-line.
- **Decks are German by default.** Write in German even when the request itself is in English; use another language only when the user explicitly asks for it ("in English", `lang=en`). Keep code, commands, flags, config keys, product names and established technical terms as they are. Cite primary sources; CVE IDs, versions and dates verbatim.

## Instructions

### Brief mode

If the arguments contain `brief=<path>` (passed by the `feature-deck` skill), read that file and treat it as the only source of facts:

- Skip Step 3 (Research) entirely. Do not search or fetch.
- Take language, slide count, footer and slide arc from the brief; `lang=`, `slides=`, `out=` and `theme=` arguments override it.
- Every number, version, date, flag and config key on a slide must appear in the brief's Verified facts or Feature detail. If a slide needs a fact the brief lacks, leave it out and list it under "Missing from brief" in the output instead of researching it.
- The "What it means for us" section always becomes its own slide; keep its *(assessment)* markers visible.
- Sources slide = the brief's Sources list.

### Step 1: Ask for the theme

Skip only when `theme=` was passed. Otherwise ask with AskUserQuestion (single select), one option per theme in `themes/` (descriptions in `reference/marp-style.md`):

| Option | Theme file |
|---|---|
| Cyber dark | `cyber-dark` |
| Light / clean | `light-clean` |
| Corporate blue | `corporate-blue` |
| Nord / minimal dark | `nord` |

### Step 2: Determine scope

Extract from the user's request; ask only when missing:

- **Topic** (required): CVE, incident, framework, library, tool, technique, AI model
- **Language**: German (`de`) unless the user explicitly asks for another
- **Audience**: technical / leadership / mixed (default: technical)
- **Slide count**: default `12`, range `10–15`
- **Output path**: default `<decks-dir>/<slug>/<slug>.md`, where `<decks-dir>` is `$MARP_DECKS_DIR` if set, else `~/Documents/Presentations`, `<slug>` = topic kebab-cased (see **Folder layout**)

### Step 3: Research

Use the playbook in `reference/sources.md`. Identify the topic class (security / AI release / framework release / generic) and pick the matching overlay. Run 5–8 parallel WebSearch calls covering primary writeup, vendor advisory, journalism and comparison sources. WebFetch the primary writeup plus at least one vendor source. Cross-check identifiers across ≥ 2 sources; if sources conflict, present both.

### Step 4: Outline and compose

Map findings to an arc with the patterns in `reference/slide-patterns.md`:

| Slide | Purpose | Pattern |
|---|---|---|
| 1 | Title + subtitle | 1 lead |
| 2 | What it is | 2 definition |
| 3 | Timeline / context | 2 or 3 |
| 4–6 | Mechanics: chain, root cause, code | 3, 4, 5 |
| 7–9 | Impact: scope, IoCs, real exploitation | 4 |
| 10 | Lessons / mitigations | 4 |
| 11 | Closing statement | 6 lead |
| 12 | Sources | 7 |

Start from `templates/deck-skeleton.md` (frontmatter without CSS), set `footer:`, and fill slides. Content limits that keep slides from overflowing:

- One idea per slide; ≤ 5 bullets; one `**bold**` per bullet at most
- Code blocks ≤ 14 lines and ≤ 70 characters per line, always with a language tag
- Tables ≤ 4 columns, ≤ 6 rows, cell text ≤ ~45 characters
- At most one code block + one callout, or one table + one callout, per slide
- `<div class="columns">…</div>` only when content genuinely needs two columns
- Slide separator: `---` on its own line, blank line above and below

Create the `<slug>/` folder and write the file into it. If `<slug>/` already exists, ask before overwriting (offer a new slug `<slug>-2/`).

### Step 5: Apply the theme and check it visually

```bash
uv run python3 ${CLAUDE_SKILL_DIR}/scripts/apply_theme.py <deck>.md <theme>   # optional: --prompt "<user@path>"
npx --yes @marp-team/marp-cli --no-stdin <deck>.md --images png -o <scratchpad>/<slug>/slide.png
```

Look at (Read) the PNGs of every slide with a code block or table, plus the title slide. Fix any slide where content overflows the bottom, a line is cut off, or a table wraps an identifier — by trimming content, never by editing CSS in the deck — then re-run both commands. Proceed only when those slides look clean.

### Step 6: Ask for the output formats and render

Ask with AskUserQuestion (multiSelect): **HTML** · **PDF** · **PPTX**. Render each choice into the deck's folder, next to the `.md`. If `<slug>.<ext>` already exists from a render in another theme, name the new one `<slug>-<theme>.<ext>` instead of overwriting it:

```bash
npx --yes @marp-team/marp-cli --no-stdin <deck>.md -o <deck>.html
npx --yes @marp-team/marp-cli --no-stdin <deck>.md --pdf -o <deck>.pdf
npx --yes @marp-team/marp-cli --no-stdin <deck>.md --pptx -o <deck>.pptx
```

Always pass `--no-stdin`: without it marp-cli waits forever for stdin whenever stdin is not a terminal (scripts, loops, agents). Run them one at a time in the foreground with a 300000 ms timeout, check each exit code, and `open` the HTML when it was chosen. PDF and PPTX use headless Chrome, downloaded on first use. PPTX slides are images, so the text is not editable; say so when PPTX is chosen.

## Folder layout

All decks live under `<decks-dir>` (`$MARP_DECKS_DIR`, else `~/Documents/Presentations`), one folder per deck, named by the deck's `<slug>`:

```
Presentations/
  <slug>/
    <slug>.md              # Marp source
    <slug>.brief.md        # research brief (feature-deck only)
    <slug>.html            # first render (also .pdf / .pptx)
    <slug>-<theme>.html    # later renders in another theme
    notes/                 # drafts and raw notes the deck was built from
    <assets>/              # demo screenshots etc.
  _archive/                # superseded or junk files; never deleted by a skill
```

- Never write a deck, brief or render to the top level of `Presentations/`; create `<slug>/` first.
- The first render of each format is `<slug>.<ext>`. Rendering again in a different theme writes `<slug>-<theme>.<ext>` and keeps the earlier files.

## Output Format

```markdown
## Deck Created

**File**: <absolute-path>.md · **Theme**: <theme> · **Slides**: <N> · **Language**: <de|en>
**Rendered**: <absolute paths of html/pdf/pptx>

Re-theme later: `uv run python3 ${CLAUDE_SKILL_DIR}/scripts/apply_theme.py <deck>.md <theme>`, then render again.

### Sources used
- [Title](url)
```

In brief mode, add **Missing from brief**: <facts a slide needed but the brief lacked, or "nothing">.

## Failure Handling

- **Empty research after 3 broadened queries**: stop and ask the user for a primary source URL
- **Topic too fresh / no public writeups yet**: produce a thinner deck with a "what's not yet known" slide rather than fabricating mechanics
- **`apply_theme.py` errors**: it prints the cause (unknown theme, missing frontmatter); fix the deck's frontmatter so `---` is on line 1, then re-run
- **marp-cli fails or times out**: report the log tail; offer the formats that did render
- **File-write failure**: report the error and intended path; offer an alternative path
- **Conflicting attributions or facts**: present both with sources, do not pick one as truth

## Notes

- Themes, palettes and how to add a new theme: `reference/marp-style.md`.
- Reference deck for tone and pacing: `<decks-dir>/teampcp-litellm-attack/teampcp-litellm-attack.html`, when it exists (its old `uncover` styling is superseded).
