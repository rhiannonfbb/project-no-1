# PROJ-1: User Authentication

## Status: In Review
**Created:** 2026-02-20
**Last Updated:** 2026-02-21

## Dependencies
- None (Basis-Feature)

## User Stories
- As a new user, I want to register with my email and password so that I can submit ideas and vote
- As a registered user, I want to log in with my credentials so that I can access my account
- As a logged-in user, I want to log out so that my session is secured on shared devices
- As a new user, I want to see clear error messages during registration so that I can fix issues (e.g., email already taken, weak password)
- As a visitor, I want to browse the idea board without logging in so that I can see what the product is about before registering

## Acceptance Criteria
- [x] User can register with email + password
- [x] User receives email confirmation after registration
- [x] User can log in with email + password
- [x] User can log out
- [x] Login state persists across page reloads (session management)
- [x] Unauthenticated users can view the public idea board (read-only)
- [x] Unauthenticated users are redirected to login when trying to submit/vote
- [x] Password must be at least 8 characters
- [x] Error messages are shown for: invalid email, weak password, wrong credentials, email already registered

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

## Implementation Notes (Frontend + Backend)

### Files Created
- `src/app/login/page.tsx` — Login form with Zod validation, error messages, returnTo redirect
- `src/app/signup/page.tsx` — Signup form with email confirmation success state
- `src/app/auth/callback/route.ts` — PKCE code exchange endpoint for email confirmation links
- `src/components/navbar.tsx` — Sticky navbar with auth-aware Sign In / Sign Up / User menu
- `src/components/auth-guard.tsx` — Wrapper component that redirects unauthenticated users to /login
- `src/components/client-providers.tsx` — Client-side AuthProvider + Navbar wrapper for layout
- `src/hooks/use-auth.tsx` — AuthContext with signUp, signIn, signOut and session state
- `src/lib/supabase.ts` — Browser Supabase client
- `src/lib/supabase-server.ts` — Server-side Supabase client using @supabase/ssr (cookie-based)
- `src/lib/validations.ts` — Zod schemas for login and signup forms
- `src/proxy.ts` — Next.js 16 Proxy (formerly middleware) for session cookie refresh
- `.env.local.example` — Documentation of required environment variables

### Supabase Dashboard Setup Required
Before testing in production, configure in Supabase Dashboard:
1. **Authentication → URL Configuration:**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`
2. **Authentication → Email:** Enable email confirmations

## QA Test Results

**Tested:** 2026-02-21
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16.1.1 Turbopack compiles successfully, no TS errors)

### Acceptance Criteria Status

#### AC-1: User can register with email + password
- [x] Signup page exists at `/signup` with email and password fields
- [x] Form uses Zod validation via `signupSchema` with react-hook-form
- [x] Calls `supabase.auth.signUp()` on submission
- [x] Shows success state ("Check your email") after successful registration

#### AC-2: User receives email confirmation after registration
- [x] `signUp()` passes `emailRedirectTo` pointing to `/auth/callback`
- [x] Auth callback route (`/auth/callback`) correctly exchanges PKCE code for session
- [x] On callback error, redirects to `/login?error=auth_failed` with friendly message

#### AC-3: User can log in with email + password
- [x] Login page exists at `/login` with email and password fields
- [x] Form uses Zod validation via `loginSchema` with react-hook-form
- [x] Calls `supabase.auth.signInWithPassword()` on submission
- [x] On success, redirects to `returnTo` param or homepage

#### AC-4: User can log out
- [x] Navbar shows "Log out" option in dropdown menu when authenticated
- [x] Calls `supabase.auth.signOut()` and clears local state
- [x] Redirects to homepage after sign-out

#### AC-5: Login state persists across page reloads (session management)
- [x] Proxy (`src/proxy.ts`) refreshes session cookie on every request via `getUser()`
- [x] Server-side client uses `@supabase/ssr` with cookie-based sessions
- [x] `AuthProvider` calls `getSession()` on mount and listens to `onAuthStateChange`

#### AC-6: Unauthenticated users can view the public idea board (read-only)
- [x] Homepage (`/`) is a server component that fetches ideas without requiring auth
- [x] Ideas query uses `ideas_with_scores` view (public read via RLS)

#### AC-7: Unauthenticated users are redirected to login when trying to submit/vote
- [x] `AuthGuard` component checks `user` from context before allowing actions
- [x] Redirects to `/login?returnTo=<path>&action=<label>` when not authenticated
- [x] `vote-buttons.tsx` and `submit-idea-dialog.tsx` both redirect to login when unauthenticated

#### AC-8: Password must be at least 8 characters
- [x] `signupSchema` enforces `.min(8, "Password must be at least 8 characters.")`
- [x] Password hint text shown below input: "Must be at least 8 characters."
- [ ] BUG: `loginSchema` only requires `.min(1)` for password -- while this is arguably correct for login (existing passwords), it means a user who somehow has a shorter password would not be blocked at login

#### AC-9: Error messages shown for invalid email, weak password, wrong credentials, email already registered
- [x] Invalid email: Zod validation shows "Please enter a valid email address."
- [x] Weak password: Zod validation shows "Password must be at least 8 characters."
- [x] Wrong credentials: Returns generic "Invalid email or password." (does not reveal which field)
- [x] Email already registered: Detects `identities.length === 0` pattern and shows "An account with this email already exists."

### Edge Cases Status

#### EC-1: User registers with an already-used email
- [x] Handled correctly -- checks `data.user.identities.length === 0` and returns appropriate error message

#### EC-2: User enters wrong password
- [x] Handled correctly -- generic "Invalid email or password." message (no field-level hint)

#### EC-3: Confirmation email does not arrive / Resend confirmation
- [ ] BUG: No "Resend confirmation email" option is implemented. The success screen after signup only shows a "Back to Sign In" button with no way to resend. This is a documented edge case in the spec.

#### EC-4: Session expires
- [x] Proxy refreshes session on every request via `getUser()`
- [ ] BUG: No explicit "Your session has expired, please log in again" message is shown. The user would simply see the logged-out navbar state without explanation.

#### EC-5: User navigates to protected action while logged out
- [x] `AuthGuard` redirects to `/login?returnTo=<path>&action=<label>`
- [x] Login page reads `action` param and shows contextual message: "Please log in to {action}."
- [x] After successful login, redirects back to `returnTo` path

### Cross-Browser Testing (Code Review)

Note: This is a code-level assessment. Manual browser testing should be performed separately.

- [x] Uses standard React/Next.js patterns -- no browser-specific APIs beyond `window.location`
- [x] Uses shadcn/ui components (Radix primitives) -- well-tested cross-browser
- [x] CSS uses Tailwind utility classes -- no vendor-specific hacks
- [x] `backdrop-blur` in navbar uses `supports-[backdrop-filter]` progressive enhancement

### Responsive Testing (Code Review)

- [x] Login card: `max-w-md` with `px-4` padding -- works at 375px
- [x] Signup card: Same responsive pattern as login
- [x] Navbar: `px-4 sm:px-6` responsive padding, `max-w-5xl` container
- [x] Forms use full-width buttons and inputs -- mobile-friendly

### Security Audit Results

#### SEC-1: Open Redirect Vulnerability in Login Page
- [ ] **CRITICAL** -- The `returnTo` query parameter in `/login` is used directly in `window.location.href` (line 66 of `login/page.tsx`) without any validation. An attacker can craft a URL like `/login?returnTo=https://evil.com` and after the user logs in, they will be redirected to the attacker's site. This can be used for phishing attacks (e.g., fake "session expired" page that steals credentials).
  - **File:** `src/app/login/page.tsx`, line 66
  - **Note:** The auth callback route (`/auth/callback`) correctly validates its `next` param with `next.startsWith('/')`, but the login page does not apply the same check.

#### SEC-2: No Rate Limiting on Authentication Endpoints
- [ ] **HIGH** -- No rate limiting or throttling exists on sign-in or sign-up attempts. An attacker could brute-force passwords or create mass accounts. Supabase has some built-in rate limiting on its auth API, but the application does not add any additional protection (e.g., client-side cooldown, IP-based throttling, CAPTCHA).
  - **Mitigation note:** Supabase Free Tier has a default rate limit of ~30 requests/second per IP, which provides some baseline protection.

#### SEC-3: No Security Headers Configured
- [ ] **HIGH** -- `next.config.ts` is empty (no custom configuration). The following security headers required by `.claude/rules/security.md` are missing:
  - `X-Frame-Options: DENY` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: origin-when-cross-origin`
  - `Strict-Transport-Security` with `includeSubDomains`
  - No Content-Security-Policy header

#### SEC-4: RLS Policy Allows User Self-Promotion to Admin
- [ ] **CRITICAL** -- The profiles table UPDATE RLS policy (`profiles: owner can update own row`) only checks `auth.uid() = id` but does NOT restrict which columns can be modified. A user could call the Supabase API directly (bypassing the UI) and set their own `role` to `'admin'`, gaining admin privileges. The policy should add a column restriction like `NEW.role = OLD.role` to prevent role escalation.
  - **File:** `supabase/migrations/20260221000001_create_profiles.sql`, lines 107-112

#### SEC-5: Supabase Client Initializes with Placeholder Values
- [ ] **LOW** -- `src/lib/supabase.ts` creates a client with `'https://placeholder.supabase.co'` and `'placeholder'` when env vars are missing. This could mask configuration errors during development and would silently fail in production without clear error messages.
  - **File:** `src/lib/supabase.ts`, line 6

#### SEC-6: Input Injection via `action` Query Parameter
- [x] **PASS** -- The `action` search param is rendered into the login page message, but React's JSX escaping prevents XSS. No `dangerouslySetInnerHTML` is used anywhere in the codebase.

#### SEC-7: Auth Callback Open Redirect Protection
- [x] **PASS** -- The `/auth/callback` route correctly validates the `next` parameter with `next.startsWith('/')` to prevent open redirect attacks.

#### SEC-8: Password Not Exposed in API Responses
- [x] **PASS** -- Supabase Auth never returns password hashes in API responses. Session tokens are properly scoped.

#### SEC-9: Sensitive Files Not Committed
- [x] **PASS** -- `.env*.local` is in `.gitignore`. No secrets found in source code. Environment variables are properly documented in `.env.local.example` with dummy values.

### Infrastructure Issues

#### INFRA-1: Lint Command Broken
- [ ] **MEDIUM** -- `npm run lint` fails with "Invalid project directory provided, no such directory: D:\Projekte\project-no-1\lint". This appears to be a Next.js/ESLint configuration issue that prevents automated code quality checks.

### Bugs Found

#### BUG-1: Open Redirect via `returnTo` Parameter
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Craft URL: `http://localhost:3000/login?returnTo=https://evil.com`
  2. Enter valid credentials and submit the login form
  3. Expected: User is redirected to the homepage or a safe internal path
  4. Actual: User is redirected to `https://evil.com`
- **File:** `src/app/login/page.tsx`, line 66
- **Priority:** Fix before deployment

#### BUG-2: RLS Policy Allows Role Escalation to Admin
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Register a normal user account
  2. Use the Supabase JS client directly (or any HTTP client) to call: `supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)`
  3. Expected: Update is rejected by RLS
  4. Actual: Update succeeds because the policy only checks ownership, not column restrictions
- **File:** `supabase/migrations/20260221000001_create_profiles.sql`, lines 107-112
- **Priority:** Fix before deployment

#### BUG-3: Missing "Resend Confirmation Email" Feature
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Register a new account on `/signup`
  2. See the "Check your email" success screen
  3. Expected: A "Resend confirmation email" button is available
  4. Actual: Only a "Back to Sign In" link is shown. No way to resend.
- **File:** `src/app/signup/page.tsx`
- **Priority:** Fix in next sprint

#### BUG-4: No Session Expiry Message
- **Severity:** Low
- **Steps to Reproduce:**
  1. Log in to the application
  2. Wait for the session to expire (or manually clear cookies)
  3. Navigate to a new page
  4. Expected: A friendly message like "Your session has expired, please log in again"
  5. Actual: The navbar silently reverts to logged-out state with no explanation
- **Priority:** Fix in next sprint

#### BUG-5: Missing Security Headers
- **Severity:** High
- **Steps to Reproduce:**
  1. Load any page in the application
  2. Open browser DevTools > Network tab
  3. Check response headers
  4. Expected: Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.) are present
  5. Actual: No custom security headers are set
- **File:** `next.config.ts` (needs headers configuration)
- **Priority:** Fix before deployment

#### BUG-6: No Rate Limiting on Auth Endpoints
- **Severity:** High
- **Steps to Reproduce:**
  1. Write a script that sends 100 login requests in rapid succession
  2. Expected: Requests are throttled after a threshold
  3. Actual: All requests are processed (subject only to Supabase's built-in limits)
- **Priority:** Fix before deployment

#### BUG-7: Lint Command Broken
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Run `npm run lint`
  2. Expected: ESLint runs and reports results
  3. Actual: Error: "Invalid project directory provided"
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 9/9 passed (all core functionality implemented correctly)
- **Edge Cases:** 3/5 passed, 2 have issues (resend email, session expiry message)
- **Bugs Found:** 7 total (2 critical, 2 high, 2 medium, 1 low)
- **Security:** Issues found -- 2 critical (open redirect, role escalation), 2 high (no rate limiting, no security headers)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-1 (open redirect) and BUG-2 (role escalation) immediately. Fix BUG-5 (security headers) and BUG-6 (rate limiting) before deployment. BUG-3, BUG-4, BUG-7 can be addressed in next sprint.

## Deployment
_To be added by /deploy_
