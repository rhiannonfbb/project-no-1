import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

/**
 * Auth Callback Route — PROJ-1: User Authentication
 *
 * Handles the OAuth/PKCE code exchange after Supabase sends the user back
 * from the email confirmation link. Supabase appends `?code=<pkce_code>` to
 * the redirect URL configured in the Auth settings.
 *
 * Flow:
 *  1. User clicks the confirmation link in their email.
 *  2. Supabase redirects to: <origin>/auth/callback?code=<code>&next=<path>
 *  3. This route exchanges the code for a session (stored in cookies).
 *  4. User is redirected to `next` (default: "/").
 *
 * On error the user is redirected to /login?error=auth_failed so they see
 * a friendly message rather than a blank page.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Reject unexpected `next` values to prevent open-redirect attacks.
  // Only allow relative paths that start with "/".
  const safeNext = next.startsWith('/') ? next : '/'

  if (code) {
    const supabase = await createSupabaseServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(
        new URL('/login?error=auth_failed', requestUrl.origin)
      )
    }
  } else {
    // No code param — could be a misconfigured redirect or a direct visit.
    console.warn('[auth/callback] No code param found in request URL.')
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
}
