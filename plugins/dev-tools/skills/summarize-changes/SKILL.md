---
name: summarize-changes
description: Summarizes recent changes in the project from git history. Use when someone asks "what changed recently" or "what's new".
---

# Summarize Changes

Fasse die letzten Änderungen im Projekt zusammen für: $ARGUMENTS

Gibt einen Überblick über kürzliche Änderungen in verständlicher Sprache, ideal für nicht-technische Stakeholder.

## Aktueller Zustand

- **Letzter Tag**: !`git describe --tags --abbrev=0 2>/dev/null || echo "Kein Tag gefunden"`
- **Letzte 10 Commits**: !`git log -10 --pretty=format:"%h|%s|%cr" --no-merges`

## Schritt 1: Eingabe validieren und Zeitraum bestimmen

Parse $ARGUMENTS:

| Eingabe | Zeitraum |
|---------|----------|
| _(leer)_ | Letzte 7 Tage |
| `today` | Nur heute |
| `week` | Letzte 7 Tage |
| `month` | Letzter Monat |
| _eine Zahl_ | Letzte N Commits |

If $ARGUMENTS doesn't match any of the above, inform the user of valid options and stop.

## Schritt 2: Commits abrufen

- Hole relevante Commits für den Zeitraum
- Filtere Merge-Commits heraus
- Gruppiere nach Thema/Funktionalität

## Schritt 3: Änderungen kategorisieren

Kategorisiere Commits nach den Kategorien in `reference/translation-guide.md`.

Übersetze technische Commit-Messages in einfache Sprache — verwende die Übersetzungstabelle und Kontextualisierungsregeln aus `reference/translation-guide.md`.

## Schritt 4: Zusammenfassung erstellen

Rendere die Zusammenfassung nach dem Format in `templates/summary-report.md`.

- Leere Kategorien weglassen
- Verwandte Änderungen gruppieren
- Auswirkungen für Endbenutzer zeigen

## Failure Handling

- **Keine Commits im Zeitraum**: "Keine Änderungen im gewählten Zeitraum gefunden." — stop.
- **Kein Git-Repository**: "Kein Git-Repository gefunden." — stop.
- **Detached HEAD**: Proceed normally — use commit range instead of branch context.

## Notes

- Read `reference/translation-guide.md` § "What NOT to Do" before writing the summary
- The "Nächste Schritte" section should only appear when commits clearly indicate upcoming work — omit it otherwise
- Statistics (Dateien geändert) can be approximate — use `git diff --stat` for the range
