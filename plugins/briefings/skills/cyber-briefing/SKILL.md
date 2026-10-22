---
name: cyber-briefing
description: Research and summarize recent cybersecurity developments — major breaches, CVEs/zero-days, ransomware campaigns, nation-state cyber ops, new security tools, and compliance changes. Use when the user asks "cybersecurity news", "what's new in security", "recent breaches", "CVE updates", "threat landscape", or wants a briefing on the current cybersecurity landscape.
context: fork
agent: Explore
---

# Cyber Briefing

Research the current cybersecurity landscape and deliver a concise, opinionated briefing on what's new and what matters.

## Instructions

### Step 1: Determine Scope

Check if the user specified:
- A **time range** (e.g., "this week", "last month"). Default: last 2-4 weeks.
- A **focus area** (e.g., "ransomware", "supply chain", "cloud security"). Default: broad coverage.
- A **depth** (e.g., "quick overview" vs "deep dive"). Default: medium — highlights with enough context to understand the threat and impact.

### Step 2: Research

Use WebSearch to run queries from `reference/sources.md`. Run multiple searches in parallel to cover:

1. **Breaches & incidents** — major data breaches, compromises, incident disclosures
2. **Vulnerabilities** — critical CVEs, zero-days, actively exploited flaws, patch releases
3. **Threat actors & campaigns** — ransomware groups, APTs, nation-state operations, new TTPs
4. **Tools & defenses** — new security tools, platform updates, defensive techniques
5. **Policy & compliance** — regulation changes, framework updates (NIST, GDPR, SOC2), government actions

For significant items, use WebFetch on the source URL to get details beyond the search snippet.

### Step 3: Filter & Prioritize

Apply these filters:
- **Skip**: minor patches with no known exploitation, unconfirmed rumors, vendor marketing fluff
- **Include**: anything that could affect the user's infrastructure, anything actively exploited, anything that changes the threat landscape
- **Highlight**: vulnerabilities in technologies the user uses (if known from context), supply chain risks relevant to developers

### Step 4: Synthesize

Organize findings into the output format below. Be direct — explain the real-world impact, not just the technical details.

## Output Format

```markdown
# Cyber Briefing — [Date Range]

## Highlights
> 2-3 sentence TL;DR of the most critical developments

🔴 Critical / breaking / high impact · 🟡 Notable / worth attention · 🟢 Positive / good news / resolved

## 💥 Breaches & Incidents

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Org/Incident]** | What happened, scale, what was exposed | [Source](url) |

## 🐛 Vulnerabilities & Exploits

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[CVE-XXXX-XXXXX]** | Affected software, severity, patch status | [Source](url) |

## 🎯 Threat Landscape

| | Item | Summary | Source |
|---|------|---------|--------|
| 🔴 | **[Actor/Campaign]** | Who, targets, what they're doing | [Source](url) |

## 🛡️ Tools & Defenses

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟢 | **[Tool/Technique]** | What it does, why it's notable | [Source](url) |

## 📋 Policy & Compliance

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Regulation/Framework]** | What changed, who's affected | [Source](url) |

## 🔮 Worth Watching

| | Item | Summary | Source |
|---|------|---------|--------|
| 🟡 | **[Threat/Campaign]** | Why it's worth tracking | [Source](url) |

## My Take
> 2-3 sentences: what's the real risk here? What should the user actually do or pay attention to?
```

Omit any section that has no findings. Don't pad with filler.

## Failure Handling

- If WebSearch returns no results for a query, try alternate phrasing or broaden the time range
- If most searches fail (network issues), tell the user and offer to retry or provide what you found from the searches that did work
- If the landscape is genuinely quiet (rare in cybersecurity), say so honestly rather than inflating minor updates

## Notes

- Cybersecurity news moves fast — always verify dates and confirm whether vulnerabilities are actively exploited vs theoretical
- Prefer primary sources (vendor advisories, CISA alerts, researcher blogs) over aggregator summaries
- When the user's stack is known, prioritize vulnerabilities and threats relevant to their technologies
- Always include CVE IDs when available
- For breaches, focus on what was actually confirmed, not speculation
- Don't hallucinate CVEs, breach details, or threat actor attributions — if attribution is uncertain, say so
- Keep table summaries under ~60 characters to prevent line wrapping in narrow terminals. Put detail in the source, not the cell.
