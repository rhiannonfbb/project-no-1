"use client"

import { useMemo, useState } from "react"
import type { Idea, IdeaStatus, SortOption, UserVotes } from "@/types"

import { IdeaCard } from "@/components/idea-card"
import { SubmitIdeaDialog } from "@/components/submit-idea-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "score",  label: "Most Votes" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

const STATUS_FILTERS: { value: IdeaStatus | "all"; label: string }[] = [
  { value: "all",         label: "All" },
  { value: "new",         label: "New" },
  { value: "planned",     label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "done",        label: "Done" },
]

interface IdeaBoardProps {
  ideas: Idea[]
  userVotes: UserVotes
  isAdmin: boolean
  currentUserId: string | null
}

export function IdeaBoard({ ideas, userVotes, isAdmin, currentUserId }: IdeaBoardProps) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("score")
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all")

  const filtered = useMemo(() => {
    let result = [...ideas]

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((idea) => idea.status === statusFilter)
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "score")  return b.score - a.score
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return 0
    })

    return result
  }, [ideas, search, sort, statusFilter])

  const hasActiveFilters = search.trim() || statusFilter !== "all"

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Ideas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} · Vote for the features you want most
          </p>
        </div>
        <SubmitIdeaDialog />
      </div>

      {/* Search + Sort controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search ideas"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort buttons */}
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={sort === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSort(opt.value)}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Status filter (PROJ-5) */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Badge
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Badge>
        ))}
        {hasActiveFilters && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
            onClick={() => { setSearch(""); setStatusFilter("all") }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ideas list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-3" />
          {hasActiveFilters ? (
            <>
              <p className="font-medium">No ideas match your search.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try different keywords or{" "}
                <button
                  className="underline underline-offset-2 hover:text-foreground"
                  onClick={() => { setSearch(""); setStatusFilter("all") }}
                >
                  clear the filters
                </button>.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">No ideas yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to submit an idea!
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Ideas list">
          {filtered.map((idea) => (
            <li key={idea.id}>
              <IdeaCard
                idea={idea}
                userVotes={userVotes}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
