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

### A) Component Structure (Visual Tree)

```
App Layout
├── Navigation Bar
│   ├── Logo/Home Link
│   ├── Language Switcher (DE/EN) → added by PROJ-6
│   └── User Menu
│       ├── [If logged out] → "Sign In" button
│       ├── [If logged out] → "Sign Up" button
│       └── [If logged in] → User Avatar + Dropdown
│           └── "Log Out" option
│
├── Login Page (/login)
│   ├── Email Input Field
│   ├── Password Input Field
│   ├── "Log In" Button
│   ├── Error Message Area
│   └── "Don't have an account? Sign up" Link
│
├── Sign Up Page (/signup)
│   ├── Email Input Field
│   ├── Password Input Field
│   ├── Password Requirements Hint (8+ characters)
│   ├── "Sign Up" Button
│   ├── Error Message Area
│   ├── Success Message (Email confirmation sent)
│   └── "Already have an account? Log in" Link
│
└── Protected Action Guard (invisible component)
    └── Checks login status before allowing Submit/Vote actions
```

### B) Data Model (Plain Language)

**User Account Information (stored in Supabase Auth):**
- Email address (unique identifier)
- Encrypted password (never stored in plain text)
- User ID (generated automatically)
- Email confirmation status (confirmed vs. pending)
- Account creation timestamp

**Session Information (stored in browser):**
- Login token (expires after 1 hour of inactivity)
- Refresh token (allows automatic re-login for 30 days)
- User's current login state (logged in vs. logged out)

**Where data lives:**
- User accounts → Supabase Auth service (cloud database)
- Session tokens → Browser's secure storage (localStorage)
- No passwords stored locally - always verified against Supabase

### C) Tech Decisions (Justified for PM)

**Why Supabase Auth instead of building our own?**
- **Security:** Supabase handles password encryption, token generation, and security best practices automatically. Building this ourselves would take weeks and risk security vulnerabilities.
- **Email confirmation:** Supabase sends confirmation emails automatically - we don't need to set up an email service.
- **Speed:** Integration takes hours, not weeks.

**Why email/password (not Google/Facebook login)?**
- **Simplicity:** OAuth adds complexity and approval processes with third parties.
- **MVP Focus:** Based on the PRD's "Non-Goals" section, we're explicitly avoiding social login for v1.
- **Future-proof:** We can add social login later if needed - Supabase supports it.

**Why public viewing without login?**
- **Lower barrier to entry:** Users can explore ideas before committing to registration.
- **Virality:** Allows sharing links to specific ideas with non-users.
- **Conversion funnel:** "Browse → See value → Register to vote" is better UX than forcing immediate signup.

**Why redirect to login (not inline popups)?**
- **Clear user flow:** Users understand they're moving to a login step.
- **Better mobile UX:** Full-page forms work better on small screens.
- **Return-to-action:** After login, we can automatically redirect users back to what they wanted to do (e.g., vote on a specific idea).

### D) Dependencies

**New packages to install:**
- `@supabase/supabase-js` - Official Supabase client for authentication and session management
- `zod` - Input validation for email/password formats (already in tech stack)
- `react-hook-form` - Form handling with error states (already in tech stack)

**Already available (no install needed):**
- shadcn/ui components: Button, Input, Label, Card, Alert for UI
- Next.js App Router for page routing

### E) User Flow Summary

**Registration Flow:**
1. User visits `/signup` page
2. Enters email + password (minimum 8 characters)
3. Clicks "Sign Up"
4. Supabase creates account + sends confirmation email
5. User sees success message: "Check your email to confirm your account"
6. After email confirmation, user can log in

**Login Flow:**
1. User visits `/login` page
2. Enters email + password
3. Clicks "Log In"
4. Supabase verifies credentials
5. Session token stored in browser
6. User redirected to homepage (or back to where they wanted to go)

**Protected Action Flow:**
1. Guest user tries to vote on an idea
2. System detects: not logged in
3. User redirected to `/login` with a message: "Please log in to vote"
4. After successful login → automatically redirected back to the idea to complete their vote

**Logout Flow:**
1. User clicks "Log Out" in navigation menu
2. Session cleared from browser
3. User redirected to homepage (can still view ideas)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
