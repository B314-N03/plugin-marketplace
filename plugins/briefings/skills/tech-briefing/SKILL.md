---
name: tech-briefing
description: Research and summarize recent web technology developments — new JS/TS/CSS releases, frontend frameworks, browser APIs, web standards, developer tooling (Vite, Next.js, Bun, etc.), and cool upcoming tech worth watching. Skips general-purpose languages (C++, Go, Rust) unless they directly affect the web ecosystem. Use when the user asks "what's new in tech", "web tech news", "frontend updates", "what's new in JS", "developer tools update", or wants a briefing on the web/frontend technology landscape.
context: fork
agent: Explore
---

# Tech Briefing

Research the current technology landscape and deliver a concise, opinionated briefing on what's new and what matters — beyond AI.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **time range** (e.g., "this week", "last month"). Default: last 2-4 weeks.
- A **focus area** (e.g., "frontend", "security", "cloud", "open source"). Default: broad coverage.
- A **depth** (e.g., "quick headlines" vs "deep dive"). Default: medium — highlights with enough context to understand why it matters.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel to cover:

1. **JS/TS ecosystem** — React, TypeScript, Node.js, Bun, Deno releases and major updates
2. **Frontend frameworks & tooling** — Next.js, Vite, Remix, Astro, TanStack, Tailwind, bundlers
3. **Web standards & browsers** — TC39 proposals landed, CSS features shipping, new browser APIs, Chrome/Firefox/Safari updates
4. **Upcoming & on the horizon** — proposals in progress, betas, RCs, newly announced projects worth watching
5. **Dev tooling** — editors, CLIs, package managers, hosting platforms (Vercel, Netlify, Cloudflare) with web relevance

**Skip**: C++, Go, Rust, Python, Kubernetes, cloud infrastructure — unless they directly affect the web ecosystem (e.g., Rust-based bundler, edge runtime changes).

For significant items, use WebFetch on the source URL to get details beyond the search snippet.

### Step 3: Filter & Prioritize

Apply these filters:
- **Skip**: C++, Go, Rust, Python releases (not web-relevant), cloud infra (K8s, AWS services), AI models (ai-briefing covers those), minor patch releases, marketing fluff
- **Include**: anything in the JS/TS/CSS/browser ecosystem, new frontend tools, web standard proposals landing, upcoming releases with real momentum
- **Highlight**: things directly relevant to the user's stack — React, TypeScript, Vite, Next.js, TanStack, Tailwind

### Step 4: Synthesize

Organize findings into the output format below. Be opinionated — don't just list things, say why they matter and what the user should pay attention to.

## Output Format

```markdown
# Tech Briefing — [Date Range]

## Highlights
> 2-3 sentence TL;DR of the most important developments

🔴 Critical / breaking / high impact · 🟡 Notable / worth attention · 🟢 Positive / good news / resolved

## 💻 JS / TS Ecosystem

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[React/TS/Node vX.Y]** | What changed, why it matters | [Source](url) |

## 🛠️ Frontend Frameworks & Tooling

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Next.js/Vite/TanStack/etc]** | What's new, impact on workflow | [Source](url) |

## 🌐 Web Standards & Browsers

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **[CSS feature / TC39 / Browser API]** | What landed, where it ships | [Source](url) |

## 🚀 On the Horizon

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Beta/RFC/Proposal]** | What's coming, why it's exciting | [Source](url) |

## My Take
> 2-3 sentences: what's the signal in the noise? What should the user actually care about?
```

Omit any section that has no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a query, try alternate phrasing or broaden the time range
- If most searches fail (network issues), tell the user and offer to retry or provide what you found from the searches that did work
- If the landscape is genuinely quiet in a category, skip that section rather than inflating minor updates

## Notes

- This skill covers general tech — AI-specific news belongs in ai-briefing. Avoid overlap, but include AI-adjacent infrastructure (e.g., GPU availability, CUDA updates) if relevant to general dev work.
- Verify dates carefully. Blog posts and release notes from months ago can rank high in search results.
- Prefer primary sources (official blogs, changelogs, GitHub releases) over aggregator summaries
- When the user's role/stack is known, weight relevance accordingly (e.g., frontend dev = emphasize JS ecosystem, CSS, browser APIs, bundlers)
- When the user writes in German, respond in German and include German-language sources
- Don't hallucinate releases or version numbers — if you're not sure something shipped, say so or skip it
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
