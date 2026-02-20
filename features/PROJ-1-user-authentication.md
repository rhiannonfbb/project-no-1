# PROJ-1: User Authentication

## Status: Planned
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

## Dependencies
- None (Basis-Feature)

## User Stories
- As a new user, I want to register with my email and password so that I can submit ideas and vote
- As a registered user, I want to log in with my credentials so that I can access my account
- As a logged-in user, I want to log out so that my session is secured on shared devices
- As a new user, I want to see clear error messages during registration so that I can fix issues (e.g., email already taken, weak password)
- As a visitor, I want to browse the idea board without logging in so that I can see what the product is about before registering

## Acceptance Criteria
- [ ] User can register with email + password
- [ ] User receives email confirmation after registration
- [ ] User can log in with email + password
- [ ] User can log out
- [ ] Login state persists across page reloads (session management)
- [ ] Unauthenticated users can view the public idea board (read-only)
- [ ] Unauthenticated users are redirected to login when trying to submit/vote
- [ ] Password must be at least 8 characters
- [ ] Error messages are shown for: invalid email, weak password, wrong credentials, email already registered

## Edge Cases
- What happens if user registers with an already-used email? → Show "Email already registered" error
- What happens if user enters wrong password? → Show "Invalid credentials" error (don't reveal which field is wrong)
- What happens if confirmation email doesn't arrive? → Provide "Resend confirmation" option
- What happens if user's session expires? → Redirect to login with a friendly message
- What happens if user navigates to a protected action while logged out? → Redirect to login, then back to intended action after login

## Technical Requirements (optional)
- Authentication via Supabase Auth (E-Mail + Passwort)
- Session handling via Supabase client-side SDK
- Protected routes/actions: Idea submission, Voting
- Public routes: Idea Board (read-only)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
