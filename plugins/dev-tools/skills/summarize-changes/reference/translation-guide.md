# Translation Guide

Reference for translating technical git history into stakeholder-friendly German.

## Change Categories

| Emoji | Category | Scope |
|-------|----------|-------|
| ✨ | Neue Funktionen | New features, capabilities |
| 🐛 | Fehlerbehebungen | Bug fixes |
| 🎨 | Design-Änderungen | UI/styling changes |
| 🧪 | Tests & Qualität | Test additions/updates |
| 📝 | Dokumentation | Docs changes |
| 🔧 | Technische Verbesserungen | Config, build, refactoring |

## Commit-Message Translation

Translate technical terms into plain German. Examples:

| Technisch | Verständlich |
|-----------|--------------|
| Refactor component | Code aufgeräumt und verbessert |
| Add unit tests | Automatische Tests hinzugefügt |
| Fix null pointer | Fehler bei fehlenden Daten behoben |
| Update dependencies | Externe Bibliotheken aktualisiert |
| Implement feature X | Neue Funktion X hinzugefügt |
| Optimize performance | Geschwindigkeit verbessert |
| Fix UI bug | Anzeigefehler behoben |

## Contextualization Rules

For each change, answer the category-specific question:

| Category | Guiding Question | Example |
|----------|-----------------|---------|
| Features | Was kann der Benutzer jetzt tun, was vorher nicht ging? | "Benutzer können jetzt mehrere Dateien gleichzeitig hochladen" |
| Bugfixes | Was funktioniert jetzt besser? | "Die Suchfunktion findet jetzt auch Ergebnisse mit Sonderzeichen" |
| Design | Wie sieht es jetzt aus? Was ist der Unterschied? | "Die Schaltflächen haben jetzt klarere Farben und sind besser zu erkennen" |

## What NOT to Do

- Do NOT fabricate "Nächste Schritte" when commits give no evidence of upcoming work
- Do NOT speculate on developer intent beyond what commit messages state
- Do NOT include merge commits in category counts or summaries
- Do NOT invent user impact that isn't supported by the actual changes
