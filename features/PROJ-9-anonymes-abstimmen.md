# PROJ-9: Anonymes Abstimmen und Einreichen

## Status: In Progress
**Created:** 2026-11-05
**Last Updated:** 2026-11-05

## Dependencies
- Requires: PROJ-2 (Public Idea Board), PROJ-3 (Idea Submission), PROJ-4 (Voting System)
- Supersedes: Login-Pflicht für Abstimmen und Einreichen (PROJ-1, PROJ-4, PROJ-3)

## User Stories
- As a Besucher, I want ohne Registrierung abstimmen und Ideen oder Bugs einreichen zu können, so that ich ohne Hürde mitmachen kann

## Acceptance Criteria
- [ ] Besucher ohne Konto können Ideen ansehen (wie bisher)
- [ ] Beim ersten Abstimmen oder Einreichen wird stillschweigend eine anonyme Supabase-Sitzung angelegt
- [ ] Anonyme Nutzer können abstimmen, Ideen und Bugs einreichen sowie ihre eigenen Ideen bearbeiten und löschen
- [ ] Anonyme Nutzer sehen „Anmelden“ und „Registrieren“ in der Navigation, nicht „Abmelden“
- [ ] Admin-Funktionen bleiben ausschließlich mit einem regulären Konto nutzbar
- [ ] RLS-Richtlinien bleiben unverändert (Rolle `authenticated`, `auth.uid() = user_id`)

## Edge Cases
- Browserdaten gelöscht oder anderer Browser → neue anonyme Identität; bisherige Stimmen und Ideen sind dort nicht sichtbar
- Missbrauch (viele Sitzungen pro Browser) → Supabase Anonymous Sign-ins mit CAPTCHA absichern (Einstellung im Supabase-Dashboard)
- Anonyme Sitzung schlägt fehl → Abstimmen und Einreichen zeigen eine Fehlermeldung

## Technical Requirements
- `use-auth`: neue Funktion `ensureUser()` ruft `signInAnonymously()` nur auf, wenn keine Sitzung existiert
- Abstimmen (`vote-buttons`) und Einreichen (`submit-idea-dialog`) nutzen `ensureUser()` statt Weiterleitung zur Anmeldung
- Navigation: `is_anonymous` wird wie „nicht angemeldet“ behandelt
- Supabase-Dashboard: „Anonymous sign-ins“ aktivieren (manuell)
- Keine Migration, keine RLS-Änderung

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
