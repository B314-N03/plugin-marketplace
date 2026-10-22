---
name: space-briefing
description: Research and summarize recent space and science developments — rocket launches, mission updates, scientific discoveries, commercial space industry, and space policy. Use when the user asks "space news", "what's new in space", "launch updates", "NASA news", "space briefing", or wants a briefing on the current space and science landscape.
context: fork
agent: Explore
---

# Space Briefing

Research the current space and science landscape and deliver a concise, enthusiastic briefing on what's happening beyond our atmosphere and at the frontiers of science.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **time range** (e.g., "this week", "last month"). Default: last 2-4 weeks.
- A **focus area** (e.g., "SpaceX", "James Webb", "Mars", "astrophysics"). Default: broad coverage.
- A **depth** (e.g., "quick overview" vs "deep dive"). Default: medium — highlights with enough context to appreciate why they matter.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel to cover:

1. **Launches** — rocket launches, mission deployments, success/failure, records
2. **Missions & exploration** — active mission updates, new discoveries from probes/rovers/telescopes
3. **Scientific discoveries** — exoplanets, astrophysics breakthroughs, astrobiology, cosmology
4. **Commercial space** — Starlink, space tourism, new companies, business milestones
5. **Policy & international** — NASA budget, ESA programs, space race dynamics, treaties

For significant items, use WebFetch on the source URL to get details beyond the search snippet.

### Step 3: Filter & Prioritize

Apply these filters:
- **Skip**: routine Starlink batch launches (unless a record or anomaly), minor schedule changes, rumor/speculation without confirmation
- **Include**: successful/failed launches of new vehicles, scientific discoveries, mission milestones, anything that makes you go "wow"
- **Highlight**: firsts (first landing, first image, first detection), breakthroughs that change our understanding, and missions the user has expressed interest in

### Step 4: Synthesize

Organize findings into the output format below. This is the enthusiast briefing — convey genuine excitement for the remarkable things happening while staying factually grounded.

## Output Format

```markdown
# Space Briefing — [Date Range]

## Highlights
> 2-3 sentence TL;DR of the most exciting developments

🔴 Major milestone / failure · 🟡 Notable update · 🟢 Success / discovery / good news

## 🚀 Launches & Missions

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **[Vehicle/Mission]** | What launched, outcome, significance | [Source](url) |

## 🔭 Scientific Discoveries

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **[Discovery]** | What was found, how, why it matters | [Source](url) |

## 🛸 Exploration Updates

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Mission/Telescope]** | Latest status, new data, what's next | [Source](url) |

## 🏢 Commercial Space

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Company/Milestone]** | What happened, industry implications | [Source](url) |

## 🌐 Policy & International

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Agency/Policy]** | What changed, what it means | [Source](url) |

## 🔮 Worth Watching

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Upcoming event]** | When, what to expect | [Source](url) |

## My Take
> 2-3 sentences: what's the big picture? What developments are genuinely pushing the frontier?
```

Omit any section that has no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a query, try alternate phrasing or broaden the time range
- If most searches fail (network issues), tell the user and offer to retry or provide what you found from the searches that did work
- If the landscape is genuinely quiet (unlikely — there's always something happening in space), say so honestly

## Notes

- Space timelines are precise — verify launch dates, mission timelines, and discovery announcements carefully
- Prefer primary sources (NASA, ESA, JAXA press releases, published papers) over aggregator summaries
- Include stunning images when missions release them — mention the URL so the user can see them
- Explain scientific significance in accessible terms — not everyone reads arXiv papers, but everyone can appreciate what finding phosphine on Venus would mean
- Don't hallucinate mission results, launch outcomes, or discovery claims — space news is verifiable, so get it right
- When upcoming events are known (launches, flybys, eclipses), mention them in "Worth Watching" so the user can follow along
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
