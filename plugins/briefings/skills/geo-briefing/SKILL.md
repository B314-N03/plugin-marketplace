---
name: geo-briefing
description: Research and summarize current geopolitical developments — conflicts, diplomacy, elections, sanctions, trade, and regional power shifts. Covers Middle East (Iran/Israel/USA), Africa, Gulf states (UAE/Saudi), Europe, Asia, and more. Use when the user asks "what's happening in the world", "geopolitics update", "world news briefing", "Middle East update", "geopolitical situation", or wants a briefing on international affairs.
context: fork
agent: Explore
---

# Geopolitical Briefing

Research current global affairs and deliver a structured, balanced briefing on what's happening and why it matters.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **region or topic** (e.g., "Middle East", "Africa", "trade wars"). Default: global overview.
- A **time range** (e.g., "this week", "last month"). Default: last 1-2 weeks.
- A **depth** (e.g., "quick headlines" vs "deep dive"). Default: medium — key events with enough context to understand significance.
- A **language**: Match the user's language. If German, include German-language sources from `reference/sources.md`.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel covering:

1. **Active conflicts & security** — military operations, escalations, ceasefires, peace talks
2. **Diplomacy & alliances** — summits, treaties, sanctions, diplomatic incidents
3. **Elections & political shifts** — elections, coups, transitions of power, protests
4. **Economic & trade** — sanctions, trade deals, energy policy, OPEC, tariffs
5. **Regional developments** — significant events in specific regions

For major events, use WebFetch on source URLs to get details and context beyond search snippets. Prefer Tier 1 sources from `reference/sources.md`.

### Step 3: Filter & Prioritize

- **Skip**: celebrity news, sports, opinion pieces without factual basis, unverified social media claims, events older than the time range
- **Include**: events that shift power dynamics, affect multiple countries, escalate/de-escalate tensions, have economic ripple effects, or are historically significant
- **Flag**: contested narratives — present both/all sides with their stated positions
- **Context**: For ongoing situations (wars, negotiations), provide 1-2 sentences of background so the briefing stands on its own

### Step 4: Synthesize

Organize findings into the output format below. Stay factual and balanced — describe what happened and what different parties say, rather than taking sides.

## Output Format

```markdown
# Geopolitical Briefing — [Date Range]

## Top Stories
> 3-4 sentence overview of the most significant developments

🔴 Critical / breaking / high impact · 🟡 Notable / worth attention · 🟢 Positive / good news / resolved

## ⚔️ Conflicts & Security

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Region/Event]** | What happened, status, key actors | [Source](url) |

## 🤝 Diplomacy & Relations

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Event/Agreement]** | Who's involved, what changed | [Source](url) |

## 🏛️ Political Shifts

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Country/Region]** | What happened, why it matters | [Source](url) |

## 💰 Economy & Trade

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Policy/Event]** | What changed, who's affected | [Source](url) |

## 🔮 Watch List

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Situation]** | Why it could escalate or shift | [Source](url) |

## Context Corner
> Brief background on 1-2 complex ongoing situations for readers who may have missed earlier developments
```

Omit any section with no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a region, try broader or alternative query phrasing
- If most searches fail (network issues), report what was found and offer to retry
- For contested events with conflicting reports, present the divergence explicitly rather than picking one narrative

## Notes

- Geopolitics is inherently contested — always present multiple perspectives on disputes
- Verify dates carefully. Ongoing conflicts can have old articles ranking high in search results.
- Prefer wire services (Reuters, AP) for factual baseline; use analysis sources (Foreign Affairs, CSIS) for context and implications
- When the user writes in German, respond in German and prioritize German-language sources alongside international ones
- Never present speculation as fact. Use hedging language ("reportedly", "according to X") for single-source claims.
- Avoid sensationalism — describe events proportionally to their actual impact
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
