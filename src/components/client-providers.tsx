"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { LanguageProvider } from "@/hooks/use-language"
import { Navbar } from "@/components/navbar"
import type { Locale } from "@/types"

interface ClientProvidersProps {
  children: React.ReactNode
  initialLocale: Locale
}

export function ClientProviders({ children, initialLocale }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLocale={initialLocale}>
        <Navbar />
        <main>{children}</main>
      </LanguageProvider>
    </AuthProvider>
  )
}
