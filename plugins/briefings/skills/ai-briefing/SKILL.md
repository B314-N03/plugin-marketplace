---
name: ai-briefing
description: Research and summarize recent AI developments — new tools, model releases, feature updates in Claude/ChatGPT/Gemini/Copilot, new frameworks, and industry shifts. Use when the user asks "what's new in AI", "AI news", "AI updates", "latest AI tools", "what happened in AI this week", or wants a briefing on the current AI landscape.
context: fork
agent: Explore
---

# AI Briefing

Research the current AI landscape and deliver a concise, opinionated briefing on what's new and what matters.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **time range** (e.g., "this week", "last month"). Default: last 2-4 weeks.
- A **focus area** (e.g., "coding tools", "open source models", "APIs"). Default: broad coverage.
- A **depth** (e.g., "quick overview" vs "deep dive"). Default: medium — highlights with enough context to understand why it matters.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel to cover:

1. **Model releases & updates** — new models, benchmarks, capability jumps
2. **Tool & product launches** — new AI tools, major feature updates to existing tools (Claude, ChatGPT, Copilot, Cursor, etc.)
3. **Developer ecosystem** — new frameworks, SDKs, APIs, platform changes
4. **Industry moves** — pricing changes, acquisitions, open-source releases, policy/regulation
5. **Claude Code skills** — new built-in slash commands from Anthropic, trending community skills in the marketplace

For significant items, use WebFetch on the source URL to get details beyond the search snippet.

### Step 3: Filter & Prioritize

Apply these filters:
- **Skip**: minor bug fixes, incremental patches, rumor/speculation without confirmation, paywalled content you can't verify
- **Include**: anything the user could act on, learn from, or that changes how they should think about their tooling choices
- **Highlight**: things directly relevant to the user's stack/role if known from context

### Step 4: Synthesize

Organize findings into the output format below. Be opinionated — don't just list things, say why they matter and what the user should pay attention to.

## Output Format

```markdown
# AI Briefing — [Date Range]

## Highlights
> 2-3 sentence TL;DR of the most important developments

🔴 Critical / breaking / high impact · 🟡 Notable / worth attention · 🟢 Positive / good news / resolved

## 🧠 Model & Platform Updates

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Model]** | What changed, why it matters | [Source](url) |
| 🟡 | **[Platform]** | What changed, why it matters | [Source](url) |

## 🚀 New Tools & Launches

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Tool]** | What it does, who it's for | [Source](url) |

## ⚙️ Developer Ecosystem

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Framework/SDK]** | What changed, impact on workflows | [Source](url) |

## 🛠️ Claude Code Skills

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **`/[skill-name]`** | What it does, Anthropic built-in or community | [Source](url) |

## 🔮 Worth Watching

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Trend/Tool]** | Why it's worth tracking | [Source](url) |

## My Take
> 2-3 sentences: what's the signal in the noise? What should the user actually care about?
```

Omit any section that has no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a query, try alternate phrasing or broaden the time range
- If most searches fail (network issues), tell the user and offer to retry or provide what you found from the searches that did work
- If the landscape is genuinely quiet (unlikely), say so honestly rather than inflating minor updates

## Notes

- The AI space moves fast — always verify dates. Something from 3 months ago is not "new"
- Prefer primary sources (official blogs, changelogs) over aggregator summaries
- When the user's role/stack is known, weight relevance accordingly (e.g., frontend dev = emphasize UI/DX tools, coding assistants, deployment platforms)
- Don't hallucinate features or releases — if you're not sure something launched, say so or skip it
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
