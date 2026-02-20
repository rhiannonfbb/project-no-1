# PROJ-6: Language Switcher (DE/EN)

## Status: In Progress
**Created:** 2026-02-20
**Last Updated:** 2026-02-20

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
