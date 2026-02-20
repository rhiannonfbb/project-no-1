# PROJ-4: Voting System

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (User Authentication) – nur eingeloggte Nutzer können voten
- Requires: PROJ-2 (Public Idea Board) – Votes werden auf dem Board angezeigt

## User Stories
- As a logged-in user, I want to upvote an idea so that I can show my support for it
- As a logged-in user, I want to downvote an idea so that I can express disagreement
- As a logged-in user, I want to remove my vote so that I can change my mind
- As a logged-in user, I want to change my vote (upvote → downvote or vice versa) so that I can correct my choice
- As a visitor, I want to see vote counts on each idea so that I can see what's popular

## Acceptance Criteria
- [ ] Logged-in users see upvote (▲) and downvote (▼) buttons on each idea
- [ ] Clicking upvote adds +1 to the idea's score
- [ ] Clicking downvote adds -1 to the idea's score
- [ ] Each user can only have one vote per idea (no double voting)
- [ ] Clicking the same vote button again removes the vote (toggle behavior)
- [ ] User can switch from upvote to downvote (and vice versa) in one click
- [ ] Vote count updates immediately in the UI (optimistic update)
- [ ] User's current vote state is visually highlighted (e.g., filled arrow)
- [ ] Unauthenticated users see vote counts but clicking vote buttons prompts login
- [ ] Users cannot vote on their own ideas (optional – discuss with PM)

## Edge Cases
- What happens if user clicks vote rapidly? → Debounce/throttle to prevent multiple API calls
- What happens if two users vote at the same time? → Database handles concurrent writes; final count is correct
- What happens if the vote API fails? → Revert optimistic update, show error toast
- What happens if an idea is deleted while user is voting? → Show "Idea no longer exists" message
- What happens if vote count goes negative? → Allow it (display negative numbers)

## Technical Requirements (optional)
- Optimistic UI updates for instant feedback
- Supabase RLS: users can only INSERT/UPDATE/DELETE their own votes
- Unique constraint: one vote per user per idea (database level)
- Vote score = SUM of all votes (+1 for upvote, -1 for downvote)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
