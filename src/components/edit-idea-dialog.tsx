"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ideaSchema, type IdeaFormValues } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import type { Idea } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface EditIdeaDialogProps {
  idea: Idea
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditIdeaDialog({ idea, open, onOpenChange }: EditIdeaDialogProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title: idea.title, description: idea.description },
  })

  const titleLength = watch("title")?.length ?? 0
  const descLength = watch("description")?.length ?? 0

  const onSubmit = async (values: IdeaFormValues) => {
    setServerError(null)
    const { error } = await supabase
      .from("ideas")
      .update({ title: values.title.trim(), description: values.description.trim() })
      .eq("id", idea.id)

    if (error) {
      setServerError("Failed to update idea. Please try again.")
      return
    }

    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="edit-title">Title</Label>
              <span className="text-xs text-muted-foreground">{titleLength}/100</span>
            </div>
            <Input
              id="edit-title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="edit-description">Description</Label>
              <span className="text-xs text-muted-foreground">{descLength}/2000</span>
            </div>
            <Textarea
              id="edit-description"
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
