# PROJ-8: Feature oder Bug kennzeichnen

## Status: In Progress
**Created:** 2026-11-05
**Last Updated:** 2026-11-05

## Dependencies
- Requires: PROJ-3 (Idea Submission) – Einreichen-Formular wird erweitert
- Requires: PROJ-2 (Public Idea Board) – Karten zeigen die Art an

## User Stories
- As a Nutzer, I want beim Einreichen angeben zu können, ob es ein Feature oder ein Bug ist, so that Fehlermeldungen und Wünsche unterscheidbar sind
- As a Nutzer, I want die Art auf jeder Karte sehen, so that ich Bugs und Features auf einen Blick erkenne

## Acceptance Criteria
- [ ] Das Einreichen-Formular hat eine Auswahl „Feature“ oder „Bug“, Vorauswahl „Feature“
- [ ] Die Auswahl ist Pflichtfeld; der Server-Wert wird mit Zod geprüft (nur „feature“ oder „bug“)
- [ ] Jede Karte zeigt die Art als Abzeichen
- [ ] Die Art kann im Bearbeiten-Dialog des Autors und eines Admins geändert werden
- [ ] Bestehende Ideen erscheinen als „Feature“
- [ ] Seitenüberschrift lautet „Feature-Ideen und Bugs“ (EN: „Feature Ideas and Bugs“)

## Edge Cases
- Spalte fehlt in der Datenbank (Migration nicht ausgeführt) → Karten zeigen „Feature“ als Fallback, Einreichen schlägt fehl
- Bugs werden nicht gesondert an Asana übergeben (Asana-Aufgabe wie bei Features, Titel unverändert)

## Technical Requirements
- DB: Spalte `ideas.idea_type` (`feature` | `bug`, Default `feature`), Migration `20261104000008_add_idea_type.sql`
- View `ideas_with_scores` wird neu angelegt, damit `idea_type` ausgeliefert wird
- Keine RLS-Änderung

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
