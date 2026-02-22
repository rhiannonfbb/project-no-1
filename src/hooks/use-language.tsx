"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import type { Locale } from "@/types"

import de from "../../messages/de.json"
import en from "../../messages/en.json"

const MESSAGES: Record<Locale, Record<string, unknown>> = { de, en }
const COOKIE_KEY = "NEXT_LOCALE"
const STORAGE_KEY = "app_language_preference"

// ---------------------------------------------------------------------------
// Simple nested-key resolver: t("auth.signIn") → messages.auth.signIn
// Supports {{placeholder}} interpolation: t("auth.loginForAction", { action: "vote" })
// ---------------------------------------------------------------------------
function resolve(
  messages: Record<string, unknown>,
  key: string,
  vars?: Record<string, string | number>
): string {
  const parts = key.split(".")
  let node: unknown = messages
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return key
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node !== "string") return key
  if (!vars) return node
  return node.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`))
}

function persistLocale(locale: Locale) {
  document.cookie = `${COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`
  try { localStorage.setItem(STORAGE_KEY, locale) } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface LanguageProviderProps {
  children: ReactNode
  initialLocale: Locale
  /** True when the SSR cookie was explicitly set; false when it defaulted to "de" */
  localeExplicit: boolean
}

export function LanguageProvider({ children, initialLocale, localeExplicit }: LanguageProviderProps) {
  const { user } = useAuth()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // BUG-2 fix: On first mount, if no explicit cookie was set, detect preferred locale
  // from localStorage (returning visitor) or navigator.language (new visitor).
  useEffect(() => {
    if (localeExplicit) return

    // 1. Returning visitor: localStorage has a saved preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "de" || stored === "en") {
        setLocaleState(stored)
        persistLocale(stored)
        return
      }
    } catch { /* ignore */ }

    // 2. New visitor: use browser language as fallback
    const browserLang = navigator.language.toLowerCase()
    const detected: Locale = browserLang.startsWith("en") ? "en" : "de"
    if (detected !== initialLocale) {
      setLocaleState(detected)
      persistLocale(detected)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally runs once on mount

  // BUG-1 fix: When a user logs in, load their saved language preference from DB.
  // This syncs the locale across devices for authenticated users.
  useEffect(() => {
    if (!user) return
    supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const pref = data?.preferred_language
        if (pref === "de" || pref === "en") {
          setLocaleState(pref)
          persistLocale(pref)
        }
      })
  }, [user?.id]) // fires whenever the logged-in user changes

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale)
      persistLocale(newLocale)

      // Persist to DB for logged-in users
      if (user) {
        supabase
          .from("profiles")
          .update({ preferred_language: newLocale })
          .eq("id", user.id)
          .then(() => {/* fire and forget */})
      }
    },
    [user]
  )

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      resolve(MESSAGES[locale], key, vars),
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
