"use client"

import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  /** The action to perform if the user is authenticated */
  onAction: () => void
  /** What the user is trying to do -- used in the redirect URL (e.g. "vote", "submit") */
  actionLabel?: string
  /** The URL to redirect back to after login */
  redirectTo?: string
  children: React.ReactNode
}

/**
 * Wraps an interactive element and checks authentication before allowing the action.
 * If the user is not logged in, they are redirected to /login with a return URL.
 *
 * Usage:
 * <AuthGuard onAction={handleVote} redirectTo="/ideas/123" actionLabel="vote">
 *   <Button>Upvote</Button>
 * </AuthGuard>
 */
export function AuthGuard({
  onAction,
  actionLabel,
  redirectTo,
  children,
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  const handleClick = () => {
    if (loading) return

    if (!user) {
      const returnPath = redirectTo ?? window.location.pathname
      const params = new URLSearchParams({ returnTo: returnPath })
      if (actionLabel) {
        params.set("action", actionLabel)
      }
      window.location.href = `/login?${params.toString()}`
      return
    }

    onAction()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      className="inline-flex"
      aria-label={actionLabel ? `${actionLabel} (login required)` : undefined}
    >
      {children}
    </div>
  )
}
