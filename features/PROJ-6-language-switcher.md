# PROJ-6: Language Switcher (DE/EN)

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
