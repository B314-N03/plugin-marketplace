---
name: morning-briefing
description: Run all briefing skills (AI, tech, geopolitics, cyber, economy, space) in parallel and compile a condensed morning digest of news from the last 24 hours with a TL;DR summary table.
when_to_use: When the user asks "morning briefing", "daily briefing", "catch me up on everything", "full briefing", "what did I miss", or wants a combined overview of the last day's news. Pass an optional window like `48h`, `last 3 days`, or `this week` to widen the lens.
argument-hint: "[time-window]"
arguments:
  - name: window
    description: Optional time window override (e.g. "24h", "48h", "last 3 days", "this week"). Defaults to 24h.
context: fork
agent: general-purpose
---

# Morning Briefing

Execute the steps below to produce a morning digest of **news from the last 24 hours** across six tracks (AI, tech, geopolitics, cyber, economy, space). Do not summarize this skill — run it.

Per-track query templates live in [reference/sources.md](reference/sources.md).

## Instructions

### Step 1: Resolve the recency window

- Read today's date from the system context (do not guess).
- If the user passed a `$window` argument (`24h`, `48h`, `last 3 days`, `this week`, etc.), parse it. Otherwise default to **24h**.
- Compute `after_date = today - window`. You will use this value in every search query and every filter check.

**Non-negotiable rule:** every item that lands in the final digest must satisfy `item.published_at >= after_date`. If you cannot determine an item's publication date, exclude it. No exceptions.

### Step 2: Resolve other scope inputs

- **Excluded topics** (e.g. "skip space"): default is all six tracks.
- **Language**: match the user's language. Respond in German if they wrote in German.

### Step 3: Run the six tracks in parallel

For each track in `reference/sources.md`, issue its 2–3 core queries via WebSearch in parallel. Every query MUST end with the date operator `after:<after_date>` — e.g. `after:2026-05-14`. Do not use `[date]` as a literal placeholder; substitute the real date.

Example query: `Claude OR ChatGPT OR Gemini new features after:2026-05-14`

For the top 1–2 stories per track, follow up with WebFetch on the source URL to confirm publication date and details.

### Step 4: Filter — date first, then relevance

1. **Drop everything published before `after_date`.** Inspect the snippet for a date, or check the WebFetch'd page's `<time>` / metadata. No date visible → drop the item.
2. From what survives, pick the 2–5 most significant items per track.

Then apply:

- **Don't duplicate** across tracks — place a cross-cutting story in its most relevant section and cross-reference briefly.
- **Don't omit a track** unless the user excluded it or zero items survived the date filter. Empty tracks render with the note `_No items in window — try a wider window or /briefings:<track>-briefing_`.
- **Prioritize actionable** items the user can act on.
- **Compress, don't summarize summaries** — one tight sentence per bullet with source link. No sub-bullets, no background paragraphs.

### Step 5: Build the TL;DR table

Build the table **after** the per-track sections so each row distills its track in one sentence.

### Step 6: Compose the output

Use the format in the "Output Format" section below. Send the final digest as your response.

## Output Format

```markdown
# Morning Briefing — [Date]

## TL;DR

| | Topic | Key Takeaway |
|---|-------|-------------|
| 🤖 | **AI** | One-sentence summary |
| 💻 | **Tech** | One-sentence summary |
| 🌍 | **Geopolitics** | One-sentence summary |
| 🔒 | **Cyber** | One-sentence summary |
| 💰 | **Economy** | One-sentence summary |
| 🚀 | **Space** | One-sentence summary |

🔴 Critical · 🟡 Notable · 🟢 Positive

---

## 🤖 AI

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Item]** | What happened, why it matters | [Source](url) |

## 💻 Tech

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Item]** | What happened, why it matters | [Source](url) |

## 🌍 Geopolitics

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Item]** | What happened, why it matters | [Source](url) |

## 🔒 Cyber

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Item]** | What happened, why it matters | [Source](url) |

## 💰 Economy

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Item]** | What happened, why it matters | [Source](url) |

## 🚀 Space

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **[Item]** | What happened, why it matters | [Source](url) |

---

*For deeper coverage: `/briefings:ai-briefing` · `/briefings:tech-briefing` · `/briefings:geo-briefing` · `/briefings:cyber-briefing` · `/briefings:econ-briefing` · `/briefings:space-briefing`*
```

If a section has zero items after the date filter, render it with the empty-window note from Step 4 — never silently widen the window.

## Failure Handling

- If a track's searches all fail (network/API), note it: `Could not fetch [topic] updates — try /briefings:<track>-briefing for a retry`.
- If most searches fail, deliver what you have and offer to retry the failed tracks.
- **If every track is empty after the date filter**, do NOT silently widen the window. Reply: `Nothing surfaced in the last <window> — rerun with /briefings:morning-briefing 48h or last 3 days.`
- Never silently drop a track — always show all six sections (or an explicit note why one is missing or empty).

## Notes

- This is a **digest**, not six full briefings concatenated. Each section: 2–5 tight bullets.
- The TL;DR table is the most important part — many mornings the user reads only that. Make each row count.
- When the user's stack/role is known (frontend dev), weight relevance in every section accordingly.
- Always end with the footer pointing to individual briefings for deeper dives.
