"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Idea, IdeaStatus, UserVotes } from "@/types"

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

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: "new",         label: "New" },
  { value: "planned",     label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "done",        label: "Done" },
]

export function IdeaCard({ idea, userVotes, isAdmin, currentUserId }: IdeaCardProps) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = currentUserId === idea.user_id
  const userVote = userVotes[idea.id] ?? null

  const handleDelete = async () => {
    setDeleting(true)
    await supabase.from("ideas").delete().eq("id", idea.id)
    router.refresh()
  }

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    await supabase.from("ideas").update({ status: newStatus }).eq("id", idea.id)
    router.refresh()
  }

  // Truncate description to ~200 chars for the list view
  const truncated = idea.description.length > 200
  const displayDescription = truncated
    ? idea.description.slice(0, 200) + "…"
    : idea.description

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
                <h3 className="text-base font-semibold leading-snug">{idea.title}</h3>
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
                      aria-label="Edit idea"
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
                      aria-label="Delete idea"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {displayDescription}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(idea.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>

              {/* Admin: status change dropdown */}
              {isAdmin && (
                <Select value={idea.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
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
            <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The idea and all its votes will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
