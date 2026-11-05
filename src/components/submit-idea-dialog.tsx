"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ideaSchema, type IdeaFormValues } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Bug, Lightbulb, Loader2 } from "lucide-react"
import type { IdeaType } from "@/types"

interface SubmitIdeaDialogProps {
  defaultType?: IdeaType
  triggerKey?: string
  dialogTitleKey?: string
  triggerVariant?: "default" | "outline"
}

export function SubmitIdeaDialog({
  defaultType = "feature",
  triggerKey = "ideas.submitIdea",
  dialogTitleKey = "submit.dialogTitle",
  triggerVariant = "default",
}: SubmitIdeaDialogProps) {
  const { ensureUser } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title: "", description: "", type: defaultType },
  })

  const titleLength = watch("title")?.length ?? 0
  const descLength = watch("description")?.length ?? 0

  const handleOpen = (value: boolean) => {
    setOpen(value)
    if (!value) reset()
  }

  const onSubmit = async (values: IdeaFormValues) => {
    setServerError(null)
    // Ohne Sitzung wird stillschweigend eine anonyme Sitzung angelegt.
    const author = await ensureUser()
    if (!author) {
      setServerError(t("submit.error"))
      return
    }
    const { error } = await supabase.from("ideas").insert({
      title: values.title.trim(),
      description: values.description.trim(),
      idea_type: values.type,
      user_id: author.id,
      original_language: locale,
      translations: { [locale]: { title: values.title.trim(), description: values.description.trim() } },
    })

    if (error) {
      setServerError(t("submit.error"))
      return
    }

    reset()
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant} className="w-full px-3">
          {triggerKey === "ideas.submitIdea" ? (
            <Lightbulb className="mr-1.5 h-4 w-4" />
          ) : (
            <Bug className="mr-1.5 h-4 w-4" />
          )}
          {t(triggerKey)}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
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
              <Label htmlFor="title">{t("submit.titleLabel")}</Label>
              <span className="text-xs text-muted-foreground">{titleLength}/100</span>
            </div>
            <Input
              id="title"
              placeholder={t("submit.titlePlaceholder")}
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive" role="alert">{t(errors.title.message!)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t("type.label")}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" aria-invalid={!!errors.type}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">{t("type.feature")}</SelectItem>
                    <SelectItem value="bug">{t("type.bug")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="description">{t("submit.descriptionLabel")}</Label>
              <span className="text-xs text-muted-foreground">{descLength}/2000</span>
            </div>
            <Textarea
              id="description"
              placeholder={t("submit.descriptionPlaceholder")}
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">{t(errors.description.message!)}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpen(false)}>
              {t("submit.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("submit.submitting")}</>
                : t("submit.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
