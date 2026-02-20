# PROJ-2: Public Idea Board

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- Requires: PROJ-1 (User Authentication) – für die Anzeige des Login-Status und CTA

## User Stories
- As a visitor, I want to see a list of all submitted ideas so that I can discover what others have requested
- As a visitor, I want to see how many votes each idea has so that I can understand popularity
- As a visitor, I want to sort ideas by most votes or newest so that I can find the most relevant ones
- As a visitor, I want to see the status of each idea (Geplant, In Arbeit, Erledigt) so that I know what's being worked on
- As a user, I want to search/filter ideas so that I can quickly find topics I care about

## Acceptance Criteria
- [ ] Page displays a list of all ideas with title, description (preview), vote count, and status
- [ ] Default sort order: most votes first
- [ ] User can switch sort order: "Most Votes", "Newest", "Oldest"
- [ ] Each idea shows its current status as a badge (Planned, In Progress, Done)
- [ ] Page is publicly accessible without login
- [ ] Search bar filters ideas by title and description text
- [ ] Page loads within 2 seconds with up to 100 ideas
- [ ] Responsive layout: works on mobile (375px), tablet (768px), and desktop (1440px)
- [ ] Empty state shown when no ideas exist yet ("Be the first to submit an idea!")

## Edge Cases
- What happens when there are no ideas yet? → Show empty state with CTA to submit first idea
- What happens with very long idea titles/descriptions? → Truncate in list view with "..." and show full text on detail view
- What happens with 500+ ideas? → Pagination or infinite scroll (defer to architecture)
- What happens when the search query matches nothing? → Show "No ideas found" with option to clear search
- What happens if database is temporarily unavailable? → Show error state with retry button

## Technical Requirements (optional)
- Server-side rendering for SEO and fast initial load
- Data fetched from Supabase `ideas` table
- Vote count displayed as aggregated value (not individual votes)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
