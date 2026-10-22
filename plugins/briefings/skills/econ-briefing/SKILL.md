---
name: econ-briefing
description: Research and summarize recent economic and market developments — central bank decisions, inflation/employment data, trade policy, market movements, commodities, and notable corporate news. Use when the user asks "economy news", "market update", "what's happening in the economy", "Fed decision", "econ briefing", or wants a briefing on the current macro-economic landscape.
context: fork
agent: Explore
---

# Econ Briefing

Research the current economic and market landscape and deliver a concise, opinionated briefing on what's moving and why it matters.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **time range** (e.g., "this week", "last month"). Default: last 2-4 weeks.
- A **focus area** (e.g., "Fed", "tech stocks", "commodities", "Europe"). Default: broad coverage.
- A **depth** (e.g., "quick overview" vs "deep dive"). Default: medium — headlines with enough context to understand the implications.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel to cover:

1. **Central banks & monetary policy** — rate decisions, forward guidance, QT/QE moves
2. **Economic data** — inflation (CPI/PCE), employment (NFP, unemployment), GDP, PMI
3. **Trade & geopolitics** — tariffs, sanctions, trade deals, supply chain disruptions
4. **Markets** — equity indices, sector rotations, notable earnings, IPOs/M&A
5. **Currencies & commodities** — USD, EUR, oil, gold, crypto if significant

For significant items, use WebFetch on the source URL to get details beyond the search snippet.

### Step 3: Filter & Prioritize

Apply these filters:
- **Skip**: routine daily market noise, minor earnings beats/misses, analyst price target changes, paywalled content you can't verify
- **Include**: policy shifts that change the macro outlook, data surprises that moved markets, trade actions with real economic impact
- **Highlight**: anything that affects the tech sector, startup funding environment, or cost of capital — since the user is in tech

### Step 4: Synthesize

Organize findings into the output format below. Be opinionated — explain what the data means, not just what the numbers are. Frame things for a tech-oriented person who wants to understand the economy without being a finance professional.

## Output Format

```markdown
# Econ Briefing — [Date Range]

## Highlights
> 2-3 sentence TL;DR of the most important economic developments

🔴 Critical / breaking / high impact · 🟡 Notable / worth attention · 🟢 Positive / good news / resolved

## 🏦 Central Banks & Policy

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Institution]** | What they did, what the guidance signals | [Source](url) |

## 📊 Economic Data

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Indicator]** | The number vs expectations, outlook implication | [Source](url) |

## 🌐 Trade & Geopolitics

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Policy/Event]** | What happened, who's affected | [Source](url) |

## 📈 Markets & Sectors

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Index/Sector]** | What moved, why, what it signals | [Source](url) |

## 💱 Currencies & Commodities

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Asset]** | Direction, drivers, implications | [Source](url) |

## 🔮 Worth Watching

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Trend/Release]** | Why it could matter | [Source](url) |

## My Take
> 2-3 sentences: what's the macro narrative right now? What should the user actually pay attention to?
```

Omit any section that has no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a query, try alternate phrasing or broaden the time range
- If most searches fail (network issues), tell the user and offer to retry or provide what you found from the searches that did work
- If the landscape is genuinely quiet, say so honestly rather than inflating minor data points

## Notes

- Economic data has specific release dates — verify that you're referencing the most recent release, not a prior one
- Prefer primary sources (central bank statements, BLS/BEA data releases, official trade announcements) over commentary
- Frame everything for a tech person: "higher rates = harder startup funding, more expensive debt" is more useful than raw basis points
- When the user's situation is known, weight relevance accordingly (e.g., investments, job market, cost of services)
- Don't speculate on future market moves — report what happened and what the data suggests
- Don't hallucinate economic data or policy decisions — if you can't verify a number, skip it
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
