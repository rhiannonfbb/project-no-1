# PROJ-6: Language Switcher (DE/EN)

## Status: In Review
**Created:** 2026-02-20
**Last Updated:** 2026-02-22

## Dependencies
- Requires: PROJ-1 (User Authentication) - for storing language preference in user profile

## User Stories
- As a user, I want to switch between German and English in the navigation so that I can use the app in my preferred language
- As a logged-in user, I want my language preference saved to my profile so that it persists across all my devices
- As a new visitor, I want the app to detect my browser language so that I see content in my preferred language by default
- As a user submitting an idea, I want my idea automatically translated to the other language so that all users can read it regardless of their language setting
- As a user reading ideas, I want to see ideas in my selected language so that I can understand all content

## Acceptance Criteria
- [ ] Language switcher (DE/EN toggle) is visible in the navigation bar
- [ ] Clicking the switcher immediately changes all UI elements (buttons, labels, error messages, status values)
- [ ] For logged-in users: Language preference is saved to user profile in Supabase
- [ ] For logged-out users: Language preference falls back to browser language detection (navigator.language)
- [ ] When user logs in, their saved language preference overrides browser detection
- [ ] All UI text is translated: Login/Signup forms, navigation, buttons, error messages, status values (Planned, In Progress, Done)
- [ ] User-submitted ideas are automatically translated via DeepL API when displayed
- [ ] Original language of idea is stored in database
- [ ] Translation happens on-the-fly when user views an idea in a different language
- [ ] If DeepL API fails, show original text with a note: "Translation unavailable"
- [ ] Language preference is loaded on page load (no flash of wrong language)

## Edge Cases
- What happens if browser language is neither DE nor EN? → Default to German (DE)
- What happens if user's browser language is DE but they manually select EN? → Manual selection overrides browser detection
- What happens if DeepL API is unavailable or quota exceeded? → Show original text with error notice: "Automatic translation currently unavailable"
- What happens if user submits an idea in a language other than DE/EN? → DeepL API detects source language automatically
- What happens if the same user logs in from multiple devices with different language settings? → User profile preference (database) is the source of truth, syncs to all devices
- What happens if translation takes too long (>2 seconds)? → Show loading skeleton while translating, timeout after 5 seconds and show original
- What happens if user changes language while viewing an idea? → Idea re-translates immediately without page reload

## Technical Requirements
- **i18n Library:** next-intl (recommended for Next.js App Router)
- **Translation API:** DeepL API Free Tier (500,000 characters/month)
- **Storage (logged-in):** New column in Supabase `profiles` table: `preferred_language` (enum: 'de' | 'en')
- **Storage (logged-out):** Browser localStorage key: `app_language_preference`
- **Performance:** UI language switch < 100ms, idea translation < 2 seconds
- **Fallback Strategy:**
  1. Logged-in users → Database profile value
  2. Logged-out users → localStorage value
  3. No stored value → Browser language (navigator.language)
  4. Browser language not DE/EN → Default to DE
- **API Rate Limiting:** Cache translated ideas in database to avoid re-translating the same idea multiple times
- **Database Schema Addition:**
  - `ideas` table: Add `original_language` (varchar) column
  - `ideas` table: Add `translations` JSONB column: `{ "de": "...", "en": "..." }`
  - `profiles` table: Add `preferred_language` (varchar, default: null)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### A) Component Structure (Visual Tree)

```
App Layout (updated across all pages)
├── Navigation Bar
│   ├── Logo/Home Link
│   ├── Language Switcher Component (NEW)
│   │   ├── DE/EN Toggle Button
│   │   └── Active Language Indicator
│   └── User Menu (from PROJ-1)
│
├── i18n Provider (invisible wrapper)
│   └── Wraps entire app, provides translations to all components
│
└── Translation Service Components (background workers)
    ├── UI Translation Handler → Switches all static text instantly
    ├── Content Translation Handler → Handles idea translations via API
    └── Language Preference Manager → Loads/saves user preference

Idea Card Component (enhanced for PROJ-2/3)
├── Idea Title (translatable)
├── Idea Description (translatable)
├── Translation Status Badge
│   ├── [If translating] → Loading skeleton
│   ├── [If translated] → "Translated from DE/EN" note
│   └── [If failed] → "Translation unavailable" warning
└── Voting/Metadata (unchanged)

Database Updates (Supabase)
├── profiles table
│   └── + preferred_language column (stores: 'de' | 'en' | null)
│
└── ideas table
    ├── + original_language column (detected language when submitted)
    └── + translations column (JSON: { "de": "...", "en": "..." })
```

### B) Data Model (Plain Language)

**Language Preference (where user's choice is stored):**
- **Logged-in users:** Stored in Supabase `profiles.preferred_language` column
  - Value: 'de' or 'en'
  - Syncs across all devices automatically
  - Loaded when user logs in

- **Logged-out users:** Stored in browser localStorage
  - Key: `app_language_preference`
  - Value: 'de' or 'en'
  - Only available on this device

**UI Translations (static text like buttons, labels):**
- Translation files stored in the app
- German file: all text in German
- English file: all text in English
- Switched instantly when user changes language (no API call needed)

**User-Generated Content Translations (ideas):**
- **Original idea:** Stored in `ideas` table with detected language
  - `original_language`: "de", "en", or auto-detected by DeepL

- **Translated versions:** Cached in database to avoid re-translating
  - `translations` column stores JSON: `{ "de": "German text", "en": "English text" }`

- **Translation workflow:**
  1. User submits idea in German → Stored as original
  2. Another user views in English → App checks cache
  3. If cached → Show immediately
  4. If not cached → Call DeepL API, translate, store in cache, display
  5. Next user viewing in English → Uses cached translation (no API call)

**Fallback Chain (how language is determined):**
1. Is user logged in with saved preference? → Use that
2. Is there a localStorage preference? → Use that
3. Can we detect browser language? → Use if DE or EN
4. None of the above? → Default to German (DE)

### C) Tech Decisions (Justified for PM)

**Why next-intl instead of react-i18next?**
- **Next.js optimization:** Built specifically for Next.js App Router, better performance
- **Server-side support:** Can render correct language on first load (no flash of wrong language)
- **Simpler setup:** Less boilerplate than react-i18next for Next.js projects
- **Type-safety:** Catches missing translations during development

**Why DeepL API instead of Google Translate?**
- **Better quality:** DeepL is known for superior DE/EN translation quality
- **Free tier:** 500,000 characters/month free (Google has no free tier)
- **Cost-effective:** After free tier, €5.49/month for 1M characters vs Google's $20
- **Spec requirement:** Already specified in the feature spec

**Why cache translations in database instead of translating every time?**
- **Cost savings:** DeepL charges per character. Re-translating the same idea 100 times wastes money
- **Speed:** Cached translation = instant display. API call = 1-2 seconds wait
- **Reliability:** If DeepL API is down, cached translations still work
- **User experience:** No loading spinners for previously translated content

**Why store preference in user profile (database) instead of just localStorage?**
- **Multi-device sync:** User sets English on phone → Automatically English on laptop
- **Better UX:** Logged-in users expect consistent experience everywhere
- **Fallback strategy:** localStorage still used for logged-out users (best of both worlds)

**Why browser language detection as fallback?**
- **Better first impression:** German speaker sees German immediately, no manual selection needed
- **International reach:** Auto-detects English speakers even if they don't change settings
- **Low risk:** If detection fails, we default to German (safe choice for German product)

**Why load language on page load (not after page renders)?**
- **Prevents "flash of wrong language":** User never sees wrong language briefly then switch
- **Professional appearance:** App feels native, not like an afterthought translation
- **Server-side rendering:** next-intl can render correct language on the server before sending HTML

### D) Dependencies

**New packages to install:**
- `next-intl` - Internationalization library for Next.js (handles UI translations)
- `@deepl/api` - Official DeepL API client for content translation

**Translation files to create:**
- `messages/de.json` - All German UI text (buttons, labels, errors, etc.)
- `messages/en.json` - All English UI text
- Structure: Nested JSON with translation keys

**Already available:**
- shadcn/ui Button component (for language switcher toggle)
- Supabase client (for saving preference to database)
- Existing API route structure (will add `/api/translate` endpoint)

### E) User Flow Summary

**First-time visitor flow:**
1. User visits homepage
2. System checks: No logged-in user, no localStorage preference
3. System detects browser language: German (de-DE)
4. App loads in German
5. User sees DE/EN switcher in navigation (currently showing "DE" as active)

**Switching language flow (logged-out user):**
1. User clicks "EN" in language switcher
2. App immediately switches all UI text to English (<100ms)
3. Preference saved to localStorage: `app_language_preference = "en"`
4. Ideas on screen start translating (loading skeleton appears)
5. DeepL API translates ideas from German to English
6. Translations cached in database
7. Ideas display in English

**Switching language flow (logged-in user):**
1. User clicks "DE" in language switcher
2. App immediately switches all UI text to German
3. Preference saved to Supabase: `profiles.preferred_language = "de"`
4. Ideas re-translate to German (use cache if available)
5. User logs in on another device → Automatically sees German

**Submitting an idea flow:**
1. User writes idea in German: "Darkmode hinzufügen"
2. Idea submitted to database
3. System stores: `original_language = "de"`
4. System stores original in translations: `{ "de": "Darkmode hinzufügen" }`
5. English user views this idea
6. System checks cache: No English translation yet
7. DeepL API called: Translates to "Add dark mode"
8. Cache updated: `{ "de": "Darkmode hinzufügen", "en": "Add dark mode" }`
9. English user sees: "Add dark mode" with note "Translated from German"

**DeepL API failure flow:**
1. User switches to English
2. App attempts to translate German idea
3. DeepL API returns error (quota exceeded / network issue)
4. App shows original German text with warning badge: "Translation currently unavailable"
5. User can still read original text and vote on idea
6. Next time API is available, translation will be cached for future

**Multi-device sync flow:**
1. User logs in on Device A, selects English → Saved to database
2. User logs in on Device B → Database loaded, app shows English
3. User changes to German on Device B → Database updated
4. User returns to Device A → Refreshes page, now sees German

## QA Test Results

**QA Run Date:** 2026-02-22
**Tester:** /qa skill (Claude Sonnet 4.6)
**Status:** FAIL — 10 bugs found (2 Critical, 3 High, 3 Medium, 2 Low)

---

### Acceptance Criteria Test Results

| # | Acceptance Criterion | Result | Notes |
|---|---------------------|--------|-------|
| AC-1 | Language switcher (DE/EN toggle) is visible in the navigation bar | PASS | Rendered via `LanguageSwitcher` in `Navbar`, present on all pages via `ClientProviders` |
| AC-2 | Clicking the switcher immediately changes all UI elements (buttons, labels, error messages, status values) | PARTIAL PASS | UI text switches instantly via context; FAIL for vote-button aria-labels which are hardcoded in English (see BUG-5) |
| AC-3 | For logged-in users: Language preference is saved to user profile in Supabase | PARTIAL PASS | DB write fires but is fire-and-forget with no error handling; preference is NOT loaded back from DB on next login (see BUG-1) |
| AC-4 | For logged-out users: Language preference falls back to browser language detection (navigator.language) | FAIL | `navigator.language` is never read. The fallback chain reads cookie → hardcoded "de" default. Browser language detection is not implemented (see BUG-2) |
| AC-5 | When user logs in, their saved language preference overrides browser detection | FAIL | The `preferred_language` column is never queried at login time; only the cookie drives SSR (see BUG-1) |
| AC-6 | All UI text is translated: Login/Signup forms, navigation, buttons, error messages, status values | PARTIAL PASS | All major UI text is translated via i18n keys; FAIL for hardcoded validation error messages in `validations.ts` and hardcoded aria-labels in `vote-buttons.tsx` (see BUG-5, BUG-6) |
| AC-7 | User-submitted ideas are automatically translated via DeepL API when displayed | PASS | `IdeaCard` triggers `/api/translate` when `locale !== original_language` |
| AC-8 | Original language of idea is stored in database | PASS | `submit-idea-dialog.tsx` stores `original_language: locale` on insert |
| AC-9 | Translation happens on-the-fly when user views an idea in a different language | PASS | `useEffect` in `IdeaCard` triggers fetch on locale change |
| AC-10 | If DeepL API fails, show original text with a note: "Translation unavailable" | PASS | `translationState === "error"` renders `t("translation.unavailable")` |
| AC-11 | Language preference is loaded on page load (no flash of wrong language) | PARTIAL PASS | Cookie-based SSR prevents flash for returning users. First-time visitors always get "de" regardless of browser language (BUG-2). No flash when cookie is set. |

---

### Security Audit

#### Red-Team Findings

| # | Finding | Severity | Location |
|---|---------|----------|----------|
| BUG-3 | XSS via `dangerouslySetInnerHTML` with unsanitized email | Critical | `signup/page.tsx:86` |
| BUG-4 | Missing UUID validation on `ideaId` in `/api/translate` — allows DB probing | High | `api/translate/route.ts:9` |
| BUG-7 | `cache_idea_translation` RPC is granted to `anon` role — unauthenticated callers can overwrite translations | High | `20260222000006_add_cache_idea_translation_rpc.sql:24` |
| BUG-8 | `action` query parameter rendered unsanitized via `t()` interpolation — potential reflected content injection | Medium | `login/page.tsx:80` |

---

### Bug Report

---

#### BUG-1 — [High] Language preference not loaded from DB on login; only cookie drives SSR

**Description:**
The spec requires "When user logs in, their saved language preference overrides browser detection" and that the database is the source of truth for logged-in users. The `LanguageProvider` reads `initialLocale` from the SSR cookie (`NEXT_LOCALE`) passed in from `layout.tsx`. The `preferred_language` column in `profiles` is never fetched at login time or at session hydration. If a user logs in from a new device or clears cookies, their saved DB preference is completely ignored — they get the hardcoded "de" default.

**File:Line:** `src/hooks/use-language.tsx` (entire provider), `src/app/layout.tsx:19-21`

**Steps to Reproduce:**
1. Log in as User A on Device 1, switch to English. Cookie is set, DB is updated.
2. On Device 2 (clean cookies), open the app and log in as User A.
3. Expected: App shows English (from DB).
4. Actual: App shows German (cookie not present, defaults to "de").

**Recommendation:** After session hydration in `useAuth` (when `user` becomes non-null), fetch `profiles.preferred_language` and call `setLocale` with that value if it differs from current locale. The `LanguageProvider` should react to the `user` object changing.

---

#### BUG-2 — [High] Browser language detection (`navigator.language`) not implemented

**Description:**
The spec and tech design both require browser language detection as a fallback: "No stored value → Browser language (navigator.language)" and "Browser language not DE/EN → Default to DE". The implementation completely skips this step. `layout.tsx` reads the `NEXT_LOCALE` cookie; if absent, it immediately falls back to "de". `navigator.language` is never consulted anywhere in the codebase. A first-time English-speaking visitor will always see German.

**File:Line:** `src/app/layout.tsx:19-21`, `src/hooks/use-language.tsx` (missing logic)

**Steps to Reproduce:**
1. Use a browser with language set to English (`en-US`).
2. Clear all cookies and localStorage for the app.
3. Visit the homepage.
4. Expected: App detects `navigator.language = "en-US"` and displays English.
5. Actual: App displays German regardless of browser language.

**Recommendation:** On first render (no cookie, no localStorage), read `navigator.language` in the client-side `LanguageProvider` and apply `setLocale` if language is "en" or starts with "en-". This must happen client-side since `navigator` is not available in SSR.

---

#### BUG-3 — [Critical] XSS via `dangerouslySetInnerHTML` with unsanitized user-controlled email value

**Description:**
In `signup/page.tsx`, the post-signup confirmation screen renders the confirmation message using `dangerouslySetInnerHTML`. The `confirmedEmail` value (taken directly from form input) is interpolated into the translation string as `<strong>${confirmedEmail}</strong>` and the entire HTML string is injected into the DOM without sanitization. If a user registers with an email like `<img src=x onerror=alert(1)>@evil.com`, the script executes in the user's browser.

Although Supabase validates email format before creating an account, the XSS executes *before* the server response is checked — `confirmedEmail` is set from `values.email` at the point the signup form is submitted, and the confirmation screen is shown based on `confirmEmail: true` returned from the server. However, if Supabase returns `confirmEmail: true` for any reason with a crafted email (or if validation is bypassed), the unescaped HTML renders.

More critically, `confirmEmail` is set to `true` whenever `data.user` exists and `data.user.identities.length > 0`. Supabase does not strictly validate HTML-special characters in email before accepting the signup attempt in all configurations.

**File:Line:** `src/app/signup/page.tsx:85-89`

```tsx
// BUG: confirmedEmail is raw user input injected as HTML
<CardDescription
  dangerouslySetInnerHTML={{
    __html: t("auth.confirmationSent", { email: `<strong>${confirmedEmail}</strong>` }),
  }}
/>
```

**Steps to Reproduce:**
1. Submit the signup form with email: `test<img src=x onerror=alert(document.cookie)>@test.com`
2. If Supabase accepts the attempt and returns confirmEmail=true, the alert fires.
3. Even if Supabase rejects it, the design is structurally unsafe.

**Recommendation:** Do not use `dangerouslySetInnerHTML` here. Replace with React children that render the email as a plain text node inside a `<strong>` element. Split the translation string into prefix, a `<strong>` element, and suffix rendered as JSX, or use a sanitization library like DOMPurify. The simplest fix: replace the `dangerouslySetInnerHTML` usage with JSX and pass the email as a text node.

---

#### BUG-4 — [High] Missing UUID format validation on `ideaId` in `/api/translate` — allows database probing and malformed queries

**Description:**
The `/api/translate` endpoint accepts `ideaId` from the POST body and passes it directly to a Supabase `.eq("id", ideaId)` query without validating that it is a UUID. The spec's tech requirements state that `ideaId` is a UUID. An attacker can send arbitrary strings as `ideaId` (e.g., very long strings, SQL-like strings, or special characters). While Supabase uses parameterized queries preventing SQL injection, invalid UUIDs cause Supabase to return an error with internal information in some configurations (DB probing). The endpoint also lacks authentication — any unauthenticated caller can invoke it without any rate limiting.

**File:Line:** `src/app/api/translate/route.ts:8-13`

```ts
// BUG: ideaId is not validated as a UUID before use
const body = await request.json() as { ideaId?: string; targetLocale?: string }
const { ideaId, targetLocale } = body
if (!ideaId || !targetLocale) {
  return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
}
```

**Steps to Reproduce:**
1. Send `POST /api/translate` with body `{ "ideaId": "' OR 1=1--", "targetLocale": "en" }`.
2. Observe response — no UUID format rejection occurs.
3. Send `{ "ideaId": "a".repeat(10000), "targetLocale": "en" }` to test for error message leakage.

**Recommendation:** Add a UUID regex or Zod `z.string().uuid()` validation for `ideaId` before querying the database. Also add authentication check (require valid session) and rate limiting on this endpoint.

---

#### BUG-5 — [Medium] Vote button `aria-label` attributes are hardcoded in English and not translated

**Description:**
The `VoteButtons` component has `aria-label="Upvote"` and `aria-label="Downvote"` hardcoded as English strings. These do not change when the user switches to German. Screen reader users who use the app in German will hear English labels for the voting controls, breaking AC-2 and AC-6. This is both an i18n and accessibility bug.

**File:Line:** `src/components/vote-buttons.tsx:83`, `src/components/vote-buttons.tsx:106`

**Steps to Reproduce:**
1. Switch to German (DE) in the language switcher.
2. Inspect the upvote button's aria-label.
3. Expected: "Upvote" in German (e.g., "Positiv bewerten").
4. Actual: "Upvote" / "Downvote" (English, unchanged).

**Recommendation:** The `vote` keys already exist in both translation files (`"vote": { "upvote": "Upvote", "downvote": "Downvote" }`). Add `useLanguage()` to `VoteButtons` and replace the hardcoded strings with `t("vote.upvote")` and `t("vote.downvote")`.

---

#### BUG-6 — [Medium] Zod validation error messages in `validations.ts` are hardcoded in English and not translated

**Description:**
All Zod schema validation error messages in `src/lib/validations.ts` are hardcoded English strings (e.g., "Email is required.", "Password must be at least 8 characters."). These messages are displayed to users in `errors.email.message` etc. When the UI language is German, form validation errors remain in English. The translation files (`de.json`) contain equivalent translated error messages under `auth.errorEmailRequired`, `auth.errorPasswordRequired`, `auth.errorPasswordLength`, `auth.errorValidEmail`.

**File:Line:** `src/lib/validations.ts:1-35`

**Steps to Reproduce:**
1. Switch to German.
2. On the login page, submit the form with an empty email field.
3. Expected: Validation error in German ("E-Mail ist erforderlich.").
4. Actual: Validation error in English ("Email is required.").

**Recommendation:** Zod validation runs at parse time and cannot easily access the i18n context. Options: (a) pass translated error messages into the schema from the component (using `zodResolver` with a map), (b) use Zod's `z.setErrorMap()` with language-aware messages, or (c) map Zod error codes to i18n keys in the form components.

---

#### BUG-7 — [High] `cache_idea_translation` RPC is granted to the `anon` role — unauthenticated users can overwrite idea translations

**Description:**
The `cache_idea_translation` PostgreSQL function is declared `SECURITY DEFINER` and granted `EXECUTE` to both `anon` and `authenticated` roles. `SECURITY DEFINER` means it runs with elevated DB owner privileges. Because the `/api/translate` route calls this RPC using the public `supabase` client (anon key), and because the RPC itself has no authentication check, any external attacker who directly calls the Supabase RPC endpoint (`/rest/v1/rpc/cache_idea_translation`) with the public anon key can overwrite the translated title and description of any idea with arbitrary content. This effectively allows unauthenticated content injection into all cached idea translations in the database.

**File:Line:** `supabase/migrations/20260222000006_add_cache_idea_translation_rpc.sql:24`

```sql
-- BUG: anon should NOT have EXECUTE on a SECURITY DEFINER function that writes data
GRANT EXECUTE ON FUNCTION cache_idea_translation(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
```

**Steps to Reproduce:**
1. Get the public Supabase URL and anon key (visible in browser network tab or `.env.local.example`).
2. Call `POST <supabase_url>/rest/v1/rpc/cache_idea_translation` with the anon key and any valid idea UUID, injecting arbitrary text for title and description.
3. Observe that the idea's `translations` JSONB column is updated with attacker-controlled content.

**Recommendation:** Remove `anon` from the GRANT. The RPC should only be callable by `authenticated` users, or better: move the translation cache write to a server-side route that uses the Supabase service role key (already available as a server-side env variable), and revoke RPC access from all public roles. The `/api/translate` route is a Next.js server route and can safely use the service role key there.

---

#### BUG-8 — [Medium] `action` URL parameter is reflected into the UI via translation interpolation without sanitization

**Description:**
In `login/page.tsx`, the `action` search parameter is read from the URL and passed directly into `t("auth.loginForAction", { action })`. The `resolve()` function in `use-language.tsx` replaces `{{action}}` with the raw string value. While this renders as a React text node (not raw HTML) and is therefore not a classical XSS vector, it is a reflected content injection vulnerability. An attacker can craft a URL like `/login?action=Please+enter+your+credit+card+number` and the UI will display "Please log in to Please enter your credit card number." This can be used for social engineering / phishing attacks.

**File:Line:** `src/app/login/page.tsx:33`, `src/app/login/page.tsx:80`

```tsx
const action = searchParams.get("action")  // unvalidated user-controlled input
...
t("auth.loginForAction", { action })  // reflected directly into UI
```

**Steps to Reproduce:**
1. Navigate to `/login?action=provide+your+banking+credentials`.
2. Observe the card description reads: "Please log in to provide your banking credentials."

**Recommendation:** Whitelist the allowed values for `action` (e.g., only `"vote"`, `"submit"`). Reject or ignore any `action` value not in the whitelist. Do not reflect arbitrary URL parameters into UI text.

---

#### BUG-9 — [Medium] Race condition: multiple simultaneous translation fetches for the same idea/locale pair

**Description:**
The `IdeaCard` `useEffect` has no in-flight request guard. When a user rapidly switches language back and forth (DE → EN → DE), or when multiple `IdeaCard` components mount simultaneously for ideas with the same locale, multiple concurrent `fetch("/api/translate", ...)` calls can be issued for the same `ideaId:locale` key before the first one completes and populates `sessionTranslationCache`. Each in-flight request independently calls DeepL and writes to the DB cache. This wastes DeepL API quota (charges per character) and can cause stale state if the second response arrives after the component has switched locale again.

**File:Line:** `src/components/idea-card.tsx:94-113`

```tsx
// BUG: No guard against concurrent in-flight fetches for the same cacheKey
setTranslationState("loading")
fetch("/api/translate", { ... })
  .then(...)
```

**Steps to Reproduce:**
1. Open a page with 10 German ideas as an English-language user.
2. All 10 `IdeaCard` components mount simultaneously and all trigger `fetch("/api/translate")` for the same locale.
3. Observe 10 parallel requests to `/api/translate` in the Network tab, all hitting DeepL.
4. Rapidly switch DE → EN → DE while translations load; observe potential stale-state rendering.

**Recommendation:** Add a module-level `Set<string>` of in-flight cacheKeys. Before calling `fetch`, check if a request is already in flight for that key; if so, skip the fetch (the cache will be populated by the first request on completion). Alternatively, use an `AbortController` tied to the `useEffect` cleanup to cancel stale requests on locale switch.

---

#### BUG-10 — [Low] Translation timeout (5-second limit per spec) is not implemented

**Description:**
The spec edge case states: "What happens if translation takes too long (>2 seconds)? → Show loading skeleton while translating, timeout after 5 seconds and show original." No timeout mechanism exists. The `fetch` call in `IdeaCard` has no `AbortController` with a timeout signal. If DeepL responds slowly or hangs, the loading state persists indefinitely until the browser's own timeout (typically 2 minutes), blocking the user from seeing any content.

**File:Line:** `src/components/idea-card.tsx:96-113`

**Steps to Reproduce:**
1. Set `DEEPL_API_KEY` to an invalid key so DeepL returns slowly or never.
2. Open the idea board as an English user viewing German ideas.
3. Observe that the loading indicator ("Wird übersetzt...") never resolves or shows fallback.
4. Expected: After 5 seconds, show original text with "Translation unavailable".
5. Actual: Indefinite loading state.

**Recommendation:** Wrap the `fetch` call with `AbortSignal.timeout(5000)` (Node 18+/modern browsers) or an `AbortController` with a `setTimeout`. In the `.catch()` handler, distinguish timeout errors from network errors and set `translationState("error")` in both cases.

---

#### BUG-11 — [Low] `aria-label` on `LanguageSwitcher` button is in English regardless of current locale

**Description:**
The `LanguageSwitcher` renders buttons with `aria-label={`Switch language to ${l.toUpperCase()}`}`. This string is hardcoded English and does not use the i18n `t()` function. A German screen reader user hears "Switch language to EN" instead of a German equivalent. The translation files do not contain a key for this label.

**File:Line:** `src/components/language-switcher.tsx:22`

```tsx
aria-label={`Switch language to ${l.toUpperCase()}`}
```

**Steps to Reproduce:**
1. Switch UI to German.
2. Inspect the aria-label of the DE/EN toggle buttons in the navigation.
3. Expected: German-language accessible label.
4. Actual: Hardcoded English "Switch language to DE" / "Switch language to EN".

**Recommendation:** Add a translation key (e.g., `"nav.switchLanguageTo"`) to both `de.json` and `en.json`, and use `t("nav.switchLanguageTo", { lang: l.toUpperCase() })` in the component.

---

### Missing Spec Feature: `next-intl` Not Used

**Description (Not a Bug — Architecture Deviation):**
The tech spec explicitly requires `next-intl` as the i18n library. The implementation instead uses a custom hand-rolled context provider (`use-language.tsx`) with a custom `resolve()` function. `next-intl` is not installed (not present in `package.json`). While the custom solution is functional, it lacks:
- Type-safe translation key checking (missing keys fall back silently to the key string)
- Plural form support (the `subtitle_one`/`subtitle_other` pluralization is implemented manually in `IdeaBoard` via a conditional, not via a standard i18n plural rule system)
- Server-side translation support (next-intl can render correct locale on server; current solution requires cookie for SSR)

This is an architecture deviation that should be acknowledged and either formally accepted as a design decision or addressed.

---

### Summary

| Bug ID | Severity | Title | File |
|--------|----------|-------|------|
| BUG-1  | High     | DB language preference not loaded on login | `use-language.tsx`, `layout.tsx` |
| BUG-2  | High     | Browser language detection not implemented | `use-language.tsx`, `layout.tsx` |
| BUG-3  | Critical | XSS via `dangerouslySetInnerHTML` with user email | `signup/page.tsx:86` |
| BUG-4  | High     | Missing UUID validation on `ideaId` in `/api/translate` | `api/translate/route.ts:9` |
| BUG-5  | Medium   | Vote button aria-labels hardcoded in English | `vote-buttons.tsx:83,106` |
| BUG-6  | Medium   | Zod validation errors hardcoded in English | `validations.ts:1-35` |
| BUG-7  | High     | `cache_idea_translation` RPC grants write access to `anon` | `20260222000006...sql:24` |
| BUG-8  | Medium   | `action` URL param reflected unsanitized in UI (phishing vector) | `login/page.tsx:33,80` |
| BUG-9  | Medium   | Race condition: concurrent translation fetches for same idea | `idea-card.tsx:94-113` |
| BUG-10 | Low      | 5-second translation timeout not implemented | `idea-card.tsx:96-113` |
| BUG-11 | Low      | LanguageSwitcher aria-label hardcoded in English | `language-switcher.tsx:22` |

**Fix Priority Order:** BUG-3 (Critical, security) → BUG-7 (High, security) → BUG-4 (High, security) → BUG-8 (Medium, security) → BUG-1 (High, functional) → BUG-2 (High, functional) → BUG-5, BUG-6, BUG-9 (Medium) → BUG-10, BUG-11 (Low)

## Deployment
_To be added by /deploy_
