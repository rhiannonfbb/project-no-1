import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Uses cookie-based session storage so that the session
 * is available both on the server and the client.
 *
 * NOTE: Must only be called from server-side code (Route Handlers, Server
 * Components, Server Actions). For client components use `@/lib/supabase`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can throw in Server Components where cookies are read-only.
            // This is safe to ignore — the middleware will refresh the session.
          }
        },
      },
    }
  )
}
