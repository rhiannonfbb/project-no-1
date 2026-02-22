"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import type { Locale } from "@/types"

const LOCALES: Locale[] = ["de", "en"]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 rounded-md border p-0.5">
      {LOCALES.map((l) => (
        <Button
          key={l}
          variant={locale === l ? "default" : "ghost"}
          size="sm"
          className="h-6 px-2 text-xs font-medium uppercase"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          aria-label={`Switch language to ${l.toUpperCase()}`}
        >
          {l.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
