"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface VoteButtonsProps {
  ideaId: string
  initialScore: number
  initialUserVote: 1 | -1 | null
}

export function VoteButtons({ ideaId, initialScore, initialUserVote }: VoteButtonsProps) {
  const { user } = useAuth()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value: 1 | -1) => {
    if (loading) return

    if (!user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}&action=vote`
      return
    }

    // Compute optimistic new state
    let newScore = score
    let newVote: 1 | -1 | null = value

    if (userVote === value) {
      // Toggle off existing vote
      newScore -= value
      newVote = null
    } else if (userVote === null) {
      // New vote
      newScore += value
    } else {
      // Switch vote direction
      newScore -= userVote
      newScore += value
    }

    // Optimistic update
    setScore(newScore)
    setUserVote(newVote)
    setLoading(true)

    try {
      if (userVote === value) {
        // Remove vote
        await supabase.from("votes").delete().eq("idea_id", ideaId).eq("user_id", user.id)
      } else if (userVote === null) {
        // Insert new vote
        await supabase.from("votes").insert({ idea_id: ideaId, user_id: user.id, value })
      } else {
        // Update existing vote
        await supabase.from("votes").update({ value }).eq("idea_id", ideaId).eq("user_id", user.id)
      }
    } catch {
      // Revert on error
      setScore(score)
      setUserVote(userVote)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          userVote === 1 && "text-emerald-600 hover:text-emerald-600"
        )}
        onClick={() => handleVote(1)}
        disabled={loading}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      <span className={cn(
        "text-sm font-semibold tabular-nums",
        score > 0 && "text-emerald-600",
        score < 0 && "text-red-500",
        score === 0 && "text-muted-foreground"
      )}>
        {score}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7",
          userVote === -1 && "text-red-500 hover:text-red-500"
        )}
        onClick={() => handleVote(-1)}
        disabled={loading}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
