# Summary Report Template

Output format for the change summary. Omit empty sections.

---

```markdown
# 📅 Änderungen im Projekt

**Zeitraum**: [von - bis]
**Anzahl der Änderungen**: [Anzahl]

## ✨ Neue Funktionen

### [Feature-Name]
[Beschreibung in einfacher Sprache]
- **Was**: [Was wurde hinzugefügt?]
- **Warum**: [Welches Problem löst das?]
- **Für wen**: [Wer profitiert davon?]

## 🐛 Fehlerbehebungen

### [Bug-Name]
[Beschreibung des behobenen Problems]
- **Problem**: [Was funktionierte nicht?]
- **Lösung**: [Wie wurde es behoben?]

## 🎨 Design-Änderungen

- [Änderung] - [Auswirkung]

## 🧪 Tests & Qualität

- [Test] - [Was wird jetzt getestet]

## 📝 Dokumentation

- [Doku] - [Was wurde dokumentiert]

## 🔧 Technische Verbesserungen

- [Verbesserung] - [Vorteil]

## 📊 Statistik

- **Commits**: [Anzahl]
- **Dateien geändert**: [ca. Anzahl]
- **Hauptentwickler**: [Namen falls relevant]

## 🎯 Fokus

[1-2 Sätze: Was war der Hauptfokus in diesem Zeitraum?]

## 🔜 Nächste Schritte

[Nur wenn aus Commits klar ersichtlich — andernfalls diesen Abschnitt weglassen]
```

---

## Worked Example

```markdown
# 📅 Änderungen im Projekt

**Zeitraum**: 30.01.2026 - 06.02.2026
**Anzahl der Änderungen**: 12 Commits

## ✨ Neue Funktionen

### Verbessertes Login-Formular
Das Login-Formular wurde neu gestaltet und ist jetzt benutzerfreundlicher.
- **Was**: Neue Eingabefelder mit besserer Fehleranzeige
- **Warum**: Benutzer hatten Schwierigkeiten zu verstehen, warum Login fehlschlug
- **Für wen**: Alle Benutzer der Anwendung

### Multi-Sprach-Unterstützung
Die Anwendung zeigt jetzt Texte in der vom Browser gewählten Sprache an.
- **Was**: Automatische Spracherkennung und Übersetzung
- **Warum**: Internationale Benutzer können die App in ihrer Sprache nutzen
- **Für wen**: Nicht-deutsche Benutzer

## 🐛 Fehlerbehebungen

### Tabellen-Sortierung
Problem mit der Sortierung von Zahlen in Tabellen wurde behoben.
- **Problem**: Zahlen wurden alphabetisch statt numerisch sortiert (1, 10, 2 statt 1, 2, 10)
- **Lösung**: Sortierung erkennt jetzt automatisch Zahlen und sortiert richtig

### Navigation
Zurück-Button funktionierte nicht auf allen Seiten.
- **Problem**: Benutzer konnten nicht zur vorherigen Seite zurück
- **Lösung**: Navigation wurde überarbeitet und funktioniert jetzt überall

## 🎨 Design-Änderungen

- Seitliche Navigation hat jetzt mehr Abstand zwischen den Elementen
- Buttons haben konsistente Größen und Abstände
- Login-Seite zeigt Sprachauswahl prominenter

## 🧪 Tests & Qualität

- Tests für Login-Komponente hinzugefügt
- Automatische Tests für Formular-Validierung
- Tests für Tabellen-Sortierung

## 📊 Statistik

- **Commits**: 12
- **Dateien geändert**: ca. 25
- **Hauptfokus**: Benutzererfahrung und Internationalisierung

## 🎯 Fokus

Der Schwerpunkt lag auf der Verbesserung der Benutzererfahrung, insbesondere beim Login und der Unterstützung mehrerer Sprachen.
```
