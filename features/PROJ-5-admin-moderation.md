# PROJ-5: Admin Moderation & Status-Tracking

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (User Authentication) – Admin muss eingeloggt sein
- Requires: PROJ-3 (Idea Submission) – es müssen Ideen existieren, die moderiert werden können

## User Stories
- As a PM/Admin, I want to set the status of an idea (New, Planned, In Progress, Done) so that users can see what's being worked on
- As a PM/Admin, I want to delete inappropriate or duplicate ideas so that the board stays clean
- As a PM/Admin, I want to see all ideas in a manageable admin view so that I can quickly moderate
- As a user, I want to see status badges on ideas so that I know if my suggestion is being considered
- As a user, I want to filter ideas by status so that I can see what's planned or done

## Acceptance Criteria
- [ ] Admin role is assigned via a flag in the database (e.g., `is_admin` column or Supabase user metadata)
- [ ] Admin can change idea status via a dropdown: New → Planned → In Progress → Done
- [ ] Admin can delete any idea (with confirmation dialog)
- [ ] Status changes are immediately visible on the public board
- [ ] Status is displayed as a colored badge on each idea (New=gray, Planned=blue, In Progress=yellow, Done=green)
- [ ] Users can filter the board by status
- [ ] Non-admin users cannot access admin actions (enforced in UI and via RLS)
- [ ] Admin actions are available directly on the idea board (no separate admin page needed for MVP)

## Edge Cases
- What happens if admin deletes an idea that has votes? → Delete cascades to votes (ON DELETE CASCADE)
- What happens if there are multiple admins? → Support multiple admins (anyone with `is_admin = true`)
- What happens if admin removes their own admin flag? → Prevent self-demotion; at least one admin must exist
- What happens if a non-admin user manipulates the API directly? → RLS policies block all admin actions for non-admins
- What happens if admin sets status to "Done" and then back to "In Progress"? → Allow status changes in any direction

## Technical Requirements (optional)
- Admin role stored in Supabase (user metadata or separate `profiles` table with `is_admin` boolean)
- RLS policies: only admins can UPDATE idea status, DELETE any idea
- First registered user or manually flagged user becomes admin
- Status enum: 'new', 'planned', 'in_progress', 'done'

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
