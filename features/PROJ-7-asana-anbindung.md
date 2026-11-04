# PROJ-7: Asana-Anbindung

## Status: In Progress
**Created:** 2026-11-04
**Last Updated:** 2026-11-04

## Dependencies
- Requires: PROJ-5 (Admin Moderation & Status-Tracking) – Freigabe erfolgt durch Admin-Statuswechsel
- Requires: PROJ-3 (Idea Submission) – es müssen Ideen existieren

## User Stories
- As a PM/Admin, I want an approved idea to automatically become a task in Asana, so that it lands in our planning without copy-paste

## Acceptance Criteria
- [ ] Freigabe = erste Statusänderung einer Idee von "new" auf planned, in_progress oder done
- [ ] Bei Freigabe entsteht genau eine Aufgabe im Asana-Projekt "Justinian Forum", Abschnitt "Feature-Voting-Board"
- [ ] Aufgabe trägt Titel und Beschreibung der Idee sowie den Status
- [ ] Ideen ohne Freigabe (Status "new") erzeugen keine Aufgabe
- [ ] Wiederholte Statuswechsel erzeugen keine zweite Aufgabe (ideas.asana_task_gid)
- [ ] Nur Admins können die Aufgabenerstellung auslösen (Route prüft profiles.role)
- [ ] Ein Asana-Fehler blockiert die Statusänderung im Board nicht

## Edge Cases
- Asana nicht erreichbar oder Token ungültig → 502, Idee bleibt freigegeben, ohne Aufgabe; erneuter Statuswechsel versucht es nicht automatisch
- Aufgabe in Asana angelegt, aber GID nicht gespeichert → 500 mit Hinweis; Gefahr einer Doppelung, bei Auftreten manuell prüfen
- Token fehlt in der Umgebung → 503

## Technical Requirements
- Env: `ASANA_ACCESS_TOKEN` (server-only, siehe `.env.local.example`)
- DB: Spalte `ideas.asana_task_gid` (Migration `20261104000007_add_asana_task_gid.sql`)
- Route: `POST /api/asana` mit `{ ideaId }`, Zod-Validierung, Session-Prüfung
- Keine RLS-Änderung

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
