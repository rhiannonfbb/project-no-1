"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { LanguageProvider } from "@/hooks/use-language"
import { Navbar } from "@/components/navbar"
import type { Locale } from "@/types"

interface ClientProvidersProps {
  children: React.ReactNode
  initialLocale: Locale
  localeExplicit: boolean
}

export function ClientProviders({ children, initialLocale, localeExplicit }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLocale={initialLocale} localeExplicit={localeExplicit}>
        <Navbar />
        <main>{children}</main>
      </LanguageProvider>
    </AuthProvider>
  )
}
