"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
    </AuthProvider>
  )
}
