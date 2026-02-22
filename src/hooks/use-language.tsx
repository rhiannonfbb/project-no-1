"use client"

import {
  createContext,
  useCallback,
  useContext,
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
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const { user } = useAuth()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale)

      // Persist to cookie (for SSR on next page load)
      document.cookie = `${COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

      // Persist to localStorage (fallback for logged-out users)
      try { localStorage.setItem(STORAGE_KEY, newLocale) } catch { /* ignore */ }

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
