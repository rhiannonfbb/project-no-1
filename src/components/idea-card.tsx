"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Idea, IdeaStatus, UserVotes } from "@/types"
import { useLanguage } from "@/hooks/use-language"

import { VoteButtons } from "@/components/vote-buttons"
import { StatusBadge } from "@/components/status-badge"
import { EditIdeaDialog } from "@/components/edit-idea-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"

interface IdeaCardProps {
  idea: Idea
  userVotes: UserVotes
  isAdmin: boolean
  currentUserId: string | null
}

const STATUS_OPTIONS: { value: IdeaStatus; labelKey: string }[] = [
  { value: "new",         labelKey: "status.new" },
  { value: "planned",     labelKey: "status.planned" },
  { value: "in_progress", labelKey: "status.in_progress" },
  { value: "done",        labelKey: "status.done" },
]

// Module-level cache: survives locale switches and component re-mounts within the same session.
// Key: "<ideaId>:<locale>", Value: translated title + description.
const sessionTranslationCache = new Map<string, { title: string; description: string }>()

// BUG-9: Deduplication of in-flight translation requests.
// Multiple cards for the same idea share one Promise instead of each firing a separate DeepL call.
const inflightTranslations = new Map<string, Promise<{ title: string; description: string } | null>>()

export function IdeaCard({ idea, userVotes, isAdmin, currentUserId }: IdeaCardProps) {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null)
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null)
  const [translationState, setTranslationState] = useState<"idle" | "loading" | "done" | "error">("idle")

  const isOwner = currentUserId === idea.user_id
  const userVote = userVotes[idea.id] ?? null
  const needsTranslation = idea.original_language && locale !== idea.original_language

  useEffect(() => {
    if (!needsTranslation) {
      setTranslatedTitle(null)
      setTranslatedDesc(null)
      setTranslationState("idle")
      return
    }

    const cacheKey = `${idea.id}:${locale}`

    // 1. Check session-level memory cache (survives locale switches)
    const memCached = sessionTranslationCache.get(cacheKey)
    if (memCached) {
      setTranslatedTitle(memCached.title)
      setTranslatedDesc(memCached.description)
      setTranslationState("done")
      return
    }

    // 2. Check DB-backed cache stored in the idea prop (from server render)
    const dbCached = idea.translations?.[locale]
    if (dbCached) {
      sessionTranslationCache.set(cacheKey, dbCached)
      setTranslatedTitle(dbCached.title)
      setTranslatedDesc(dbCached.description)
      setTranslationState("done")
      return
    }

    // 3. Fetch from DeepL via API route (also writes back to DB)
    // BUG-9: Share one in-flight Promise across all cards rendering the same idea+locale.
    // BUG-10: 5 s timeout so a hung DeepL call never blocks the UI indefinitely.
    setTranslationState("loading")

    let promise = inflightTranslations.get(cacheKey)
    if (!promise) {
      promise = fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id, targetLocale: locale }),
        signal: AbortSignal.timeout(5000),
      })
        .then((r) => r.json())
        .then((data: { title?: string; description?: string }) =>
          data.title && data.description
            ? { title: data.title, description: data.description }
            : null
        )
        .catch(() => null)
        .finally(() => inflightTranslations.delete(cacheKey))

      inflightTranslations.set(cacheKey, promise)
    }

    promise.then((translation) => {
      if (translation) {
        sessionTranslationCache.set(cacheKey, translation)
        setTranslatedTitle(translation.title)
        setTranslatedDesc(translation.description)
        setTranslationState("done")
      } else {
        setTranslationState("error")
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea.id, locale, needsTranslation])

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from("ideas").delete().eq("id", idea.id)
    router.refresh()
  }

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    await supabase.from("ideas").update({ status: newStatus }).eq("id", idea.id)
    router.refresh()
  }

  const displayTitle = translatedTitle ?? idea.title
  const displayDescription = translatedDesc ?? idea.description

  // Truncate description to ~200 chars for the list view
  const truncated = displayDescription.length > 200
  const shortDescription = truncated ? displayDescription.slice(0, 200) + "…" : displayDescription

  const dateLocale = locale === "de" ? "de-DE" : "en-US"

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 p-4">
          {/* Vote column */}
          <div className="flex-shrink-0">
            <VoteButtons
              ideaId={idea.id}
              initialScore={idea.score}
              initialUserVote={userVote}
            />
          </div>

          {/* Content column */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold leading-snug">{displayTitle}</h3>
                <StatusBadge status={idea.status} />
              </div>

              {/* Actions */}
              {(isOwner || isAdmin) && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowEdit(true)}
                      aria-label={t("edit.dialogTitle")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {(isOwner || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setShowDelete(true)}
                      aria-label={t("delete.title")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {translationState === "loading" ? (
              <p className="mt-1 text-sm text-muted-foreground/60 italic animate-pulse">
                {t("translation.loading")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {shortDescription}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(idea.created_at).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {translationState === "done" && (
                  <span className="text-xs text-muted-foreground/70 italic">
                    {t("translation.translatedFrom", { lang: (idea.original_language ?? "").toUpperCase() })}
                  </span>
                )}
                {translationState === "error" && needsTranslation && (
                  <span className="text-xs text-muted-foreground/70 italic">
                    {t("translation.unavailable")}
                  </span>
                )}
              </div>

              {/* Admin: status change dropdown */}
              {isAdmin && (
                <Select value={idea.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      {showEdit && (
        <EditIdeaDialog idea={idea} open={showEdit} onOpenChange={setShowEdit} />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? t("delete.deleting") : t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
