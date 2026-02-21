import { createSupabaseServerClient } from "@/lib/supabase-server"
import { IdeaBoard } from "@/components/idea-board"
import type { Idea, UserVotes } from "@/types"

/**
 * Homepage — PROJ-2: Public Idea Board
 *
 * Server Component: fetches ideas with scores and the current user's votes,
 * then renders the client-side IdeaBoard for interactive sort/filter/voting.
 */
export default async function Home() {
  const supabase = await createSupabaseServerClient()

  // Fetch ideas with vote scores (public, no auth required)
  const { data: ideasData } = await supabase
    .from("ideas_with_scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(200)

  const ideas: Idea[] = ideasData ?? []

  // Fetch current user + their votes (if logged in)
  const { data: { user } } = await supabase.auth.getUser()

  let userVotes: UserVotes = {}
  let isAdmin = false

  if (user) {
    // Get user's current votes
    const { data: votesData } = await supabase
      .from("votes")
      .select("idea_id, value")
      .eq("user_id", user.id)

    userVotes = Object.fromEntries(
      (votesData ?? []).map((v) => [v.idea_id, v.value as 1 | -1])
    )

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    isAdmin = profile?.role === "admin"
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <IdeaBoard
        ideas={ideas}
        userVotes={userVotes}
        isAdmin={isAdmin}
        currentUserId={user?.id ?? null}
      />
    </div>
  )
}
