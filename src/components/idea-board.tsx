"use client"

import { useMemo, useState } from "react"
import type { Idea, IdeaStatus, SortOption, UserVotes } from "@/types"
import { useLanguage } from "@/hooks/use-language"

import { IdeaCard } from "@/components/idea-card"
import { SubmitIdeaDialog } from "@/components/submit-idea-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Search, X } from "lucide-react"

interface IdeaBoardProps {
  ideas: Idea[]
  userVotes: UserVotes
  isAdmin: boolean
  currentUserId: string | null
}

export function IdeaBoard({ ideas, userVotes, isAdmin, currentUserId }: IdeaBoardProps) {
  const { t } = useLanguage()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("score")
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all")

  const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
    { value: "score",  labelKey: "ideas.mostVotes" },
    { value: "newest", labelKey: "ideas.newest" },
    { value: "oldest", labelKey: "ideas.oldest" },
  ]

  const STATUS_FILTERS: { value: IdeaStatus | "all"; labelKey: string }[] = [
    { value: "all",         labelKey: "ideas.filterAll" },
    { value: "new",         labelKey: "status.new" },
    { value: "planned",     labelKey: "status.planned" },
    { value: "in_progress", labelKey: "status.in_progress" },
    { value: "done",        labelKey: "status.done" },
  ]

  const filtered = useMemo(() => {
    let result = [...ideas]

    if (statusFilter !== "all") {
      result = result.filter((idea) => idea.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      if (sort === "score")  return b.score - a.score
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return 0
    })

    return result
  }, [ideas, search, sort, statusFilter])

  const hasActiveFilters = search.trim() || statusFilter !== "all"
  const clearFilters = () => { setSearch(""); setStatusFilter("all") }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("ideas.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t(ideas.length === 1 ? "ideas.subtitle_one" : "ideas.subtitle_other", { count: ideas.length })}
          </p>
        </div>
        <SubmitIdeaDialog />
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("ideas.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label={t("ideas.searchPlaceholder")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t("ideas.clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={sort === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSort(opt.value)}
              className="text-xs"
            >
              {t(opt.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Badge
            key={f.value}
            variant={statusFilter === f.value ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() => setStatusFilter(f.value)}
          >
            {t(f.labelKey)}
          </Badge>
        ))}
        {hasActiveFilters && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
            onClick={clearFilters}
          >
            {t("ideas.clearFilters")}
          </button>
        )}
      </div>

      {/* Ideas list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Lightbulb className="h-10 w-10 text-muted-foreground/50 mb-3" />
          {hasActiveFilters ? (
            <>
              <p className="font-medium">{t("ideas.noResultsTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ideas.noResultsSubtitle")}{" "}
                <button className="underline underline-offset-2 hover:text-foreground" onClick={clearFilters}>
                  {t("ideas.noResultsClear")}
                </button>.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">{t("ideas.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("ideas.emptySubtitle")}</p>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Ideas list">
          {filtered.map((idea) => (
            <li key={idea.id}>
              <IdeaCard idea={idea} userVotes={userVotes} isAdmin={isAdmin} currentUserId={currentUserId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
