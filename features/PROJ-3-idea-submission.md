# PROJ-3: Idea Submission

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (User Authentication) – nur eingeloggte Nutzer können Ideen einreichen
- Requires: PROJ-2 (Public Idea Board) – Ideen werden auf dem Board angezeigt

## User Stories
- As a logged-in user, I want to submit a new idea with a title and description so that others can see and vote on it
- As a logged-in user, I want to see my own submitted ideas so that I can track what I've contributed
- As a logged-in user, I want to edit my own idea so that I can fix typos or improve the description
- As a logged-in user, I want to delete my own idea so that I can remove irrelevant submissions

## Acceptance Criteria
- [ ] Logged-in users see a "Submit Idea" button on the board
- [ ] Submission form has fields: Title (required, max 100 chars) and Description (required, max 2000 chars)
- [ ] Form validates input and shows inline error messages
- [ ] After successful submission, idea appears on the board immediately
- [ ] User can edit their own ideas (title and description)
- [ ] User can delete their own ideas (with confirmation dialog)
- [ ] Users cannot edit or delete other users' ideas
- [ ] Unauthenticated users see a "Login to submit" prompt instead of the submit button
- [ ] New ideas get default status "New" (not yet reviewed by admin)

## Edge Cases
- What happens if user submits a duplicate title? → Allow it (different users may have similar ideas)
- What happens if user submits an empty form? → Show inline validation errors, prevent submission
- What happens if user's session expires mid-submission? → Save draft in local storage, redirect to login, restore after login
- What happens if the title is exactly 100 chars? → Accept it (boundary valid)
- What happens if user tries to edit/delete someone else's idea? → Hide edit/delete buttons; enforce via RLS on backend

## Technical Requirements (optional)
- Input validation with Zod (client + server)
- Supabase RLS: users can only INSERT/UPDATE/DELETE their own ideas
- XSS prevention: sanitize user input before rendering

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
