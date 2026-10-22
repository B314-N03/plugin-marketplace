# Research Sources & Queries

Layered playbook. Start with the general layer for any topic; add the specialized overlay that matches the topic class.

## Hierarchy of trust

Always prefer in this order: **primary writeup → vendor advisory → reputable journalism → aggregator/secondhand**. Never cite a tweet or HN comment as a fact source — only for sentiment / discovery.

Capture verbatim:
- Identifiers: CVE IDs, CVSS scores, package names + versions, commit SHAs, release tags, model IDs
- Dates: disclosed, released, patched, publicly known
- Direct quotes only when load-bearing (root-cause sentence, attribution claim)

No speculative attribution. If sources conflict, present both.

---

## General tech topic (any framework, library, tool, AI model)

**Primary sources**
- Project's official site / docs
- GitHub repo: `README.md`, `CHANGELOG.md`, release notes for the relevant tag
- Maintainer / vendor blog announcement
- RFC / specification (for protocol-level topics)

**Discussion / sentiment** (not facts)
- Hacker News thread
- Reddit (`r/programming`, `r/<technology>`)

**Search query templates**
- `<topic> release notes`
- `<topic> announcement <year>`
- `<topic> vs <competitor>`
- `<topic> deprecated` / `<topic> migration guide`

---

## Security overlay (CVE, breach, advisory, supply-chain)

**Primary sources**
- NVD: `https://nvd.nist.gov/vuln/detail/<CVE>`
- GitHub Security Advisories (GHSA): `https://github.com/advisories/<GHSA-id>`
- CISA Known Exploited Vulnerabilities catalog
- Vendor advisory page (e.g., Microsoft MSRC, Cisco PSIRT, Atlassian Trust Center)
- Researcher's primary writeup (vendor blog of the discoverer)

**Supply chain specific**
- Socket.dev (npm/PyPI threat intel)
- Snyk: `https://snyk.io/vuln/<id>`
- npm advisory db, PyPI security
- The malicious commit SHA on GitHub (verify it still exists)

**Journalism (use as secondary, never primary)**
- BleepingComputer
- The Record (Recorded Future)
- Krebs on Security
- Dark Reading

**Search query templates**
- `<CVE-XXXX-YYYYY>`
- `<package-name> compromised` / `<package-name> malicious`
- `<incident> postmortem` / `<incident> root cause`
- `site:bleepingcomputer.com OR site:therecord.media OR site:krebsonsecurity.com <topic>`
- `<vendor> security advisory <year>`

---

## AI / model release overlay

**Primary sources**
- Official announcement post (lab blog: anthropic.com, openai.com, deepmind.google, mistral.ai, huggingface.co/blog)
- Model card / system card
- Technical report / paper (arXiv link if released)
- Pricing & API docs page

**Benchmarks**
- Reported numbers from the announcement (note: vendor-supplied)
- Independent eval: ScaleAI, Artificial Analysis, lmarena.ai
- HumanEval / MMLU / SWE-bench numbers if relevant

**Search query templates**
- `<model-name> announcement` / `<model-name> release`
- `<model-name> benchmark`
- `<model-name> system card`
- `<model-name> vs <competitor> benchmark`

---

## Framework / library release overlay

**Primary sources**
- GitHub release page for the tag
- Migration guide (often linked from release notes)
- Maintainer's blog post

**Comparisons / analysis**
- Independent technical writeups (search by version: `<framework> <version> what's new`)
- Performance benchmarks if performance is part of the story

**Search query templates**
- `<framework> v<version> release notes`
- `<framework> v<version> breaking changes`
- `<framework> migrate from v<previous>`

---

## Workflow

1. **Identify topic class** (security incident? AI release? framework version? generic tool?). Pick the matching overlay.
2. **Run 5–8 parallel WebSearch calls** spanning the layers (primary, advisory, journalism, comparison).
3. **WebFetch the primary writeup and at least one vendor / advisory source.** Snippets aren't enough for accurate identifiers and dates.
4. **Cross-check identifiers** (CVE IDs, version numbers, dates) across at least 2 sources. Flag inconsistencies in the deck rather than picking one.
5. **Capture the source URLs** as you go — they go on the final Sources slide.
