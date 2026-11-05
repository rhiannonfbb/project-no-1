"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, User } from "lucide-react"

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const { t } = useLanguage()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          {t("nav.voteBoard")}
        </Link>

        <div className="flex items-center gap-3">

          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : user && !user.is_anonymous ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
