"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import { AlertCircle, Loader2, Plus } from "lucide-react"

export function SubmitIdeaDialog() {
  const { user } = useAuth()
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title: "", description: "" },
  })

  const titleLength = watch("title")?.length ?? 0
  const descLength = watch("description")?.length ?? 0

  const handleOpen = (value: boolean) => {
    if (value && !user) {
      window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}&action=${encodeURIComponent(t("submit.submit").toLowerCase())}`
      return
    }
    setOpen(value)
    if (!value) reset()
  }

  const onSubmit = async (values: IdeaFormValues) => {
    setServerError(null)
    const { error } = await supabase.from("ideas").insert({
      title: values.title.trim(),
      description: values.description.trim(),
      user_id: user!.id,
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("ideas.submitIdea")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("submit.dialogTitle")}</DialogTitle>
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
