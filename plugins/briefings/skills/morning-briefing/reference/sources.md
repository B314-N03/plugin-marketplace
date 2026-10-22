# Morning Briefing — Source Queries

Per-track search queries for the morning digest. Run 2–3 queries per track in parallel.

**Every query must end with `after:<after_date>`** — substitute the actual date computed in Step 1 of `SKILL.md` (e.g. `after:2026-05-14` for a 24h window on 2026-05-15). The `after:` operator bounds results at the search engine, not just as keyword noise. Never use a `[date]` placeholder.

For the top 1–2 surviving stories per track, follow up with WebFetch on the source URL to confirm publication date and details.

## Track 1: AI (mirrors `ai-briefing`)

- `Claude OR ChatGPT OR Gemini OR Copilot new features update after:<after_date>` — flagship assistant changes.
- `new AI developer tools after:<after_date>` — tooling launches.
- `AI model release announcement after:<after_date>` — fresh model drops.

## Track 2: Tech (mirrors `tech-briefing`)

- `new programming language release framework update after:<after_date>` — language/runtime releases.
- `developer tools new release update after:<after_date>` — IDE, bundler, build-tool news.
- `open source major release milestone after:<after_date>` — notable OSS milestones.

## Track 3: Geopolitics (mirrors `geo-briefing`)

- `world news geopolitics after:<after_date>` — top-level world events.
- `international relations conflict diplomacy update after:<after_date>` — diplomacy / conflict beats.
- `global economy trade sanctions after:<after_date>` — trade & sanctions moves.

## Track 4: Cyber (mirrors `cyber-briefing`)

- `cybersecurity breach vulnerability CVE after:<after_date>` — disclosed breaches & CVEs.
- `ransomware nation-state cyber attack after:<after_date>` — campaign-level news.
- `security tools compliance update after:<after_date>` — defensive tooling & regulation.

## Track 5: Economy (mirrors `econ-briefing`)

- `central bank rate decision inflation after:<after_date>` — monetary policy.
- `stock market economy trade policy after:<after_date>` — markets & macro policy.
- `tech sector earnings funding IPO after:<after_date>` — tech-specific moves the user is likely to care about.

## Track 6: Space (mirrors `space-briefing`)

- `rocket launch mission update after:<after_date>` — launches & mission status.
- `space discovery NASA ESA SpaceX after:<after_date>` — agency / private discoveries.
- `James Webb telescope discovery after:<after_date>` — JWST findings.

## Date-filter notes

- The `after:` operator on Google Search accepts `YYYY-MM-DD`, `YYYY-MM`, or `YYYY`. Always use the full `YYYY-MM-DD` form.
- A query like `after:2026-05-14` returns results crawled or published on or after that date — but crawlers index older pages too, so the post-fetch publication-date check in SKILL.md Step 3 is still required.
- For tighter granularity than a day (e.g. `1h`, `6h` window overrides), there is no native operator. Use `after:<yesterday>` and rely on the post-fetch date check to drop items older than the requested window.
