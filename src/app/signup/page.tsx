"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { signupSchema, type SignupFormValues } from "@/lib/validations"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react"

export default function SignupPage() {
  const { signUp } = useAuth()
  const { t } = useLanguage()

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [confirmedEmail, setConfirmedEmail] = useState("")
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null)
    setIsSubmitting(true)

    try {
      const { error, confirmEmail } = await signUp(values.email, values.password)

      if (error) {
        setServerError(error)
        setIsSubmitting(false)
        return
      }

      if (confirmEmail) {
        setConfirmedEmail(values.email)
        setEmailSent(true)
      }
    } catch {
      setServerError(t("auth.errorUnexpected"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResendStatus("sending")
    const { error } = await supabase.auth.resend({ type: "signup", email: confirmedEmail })
    setResendStatus(error ? "error" : "sent")
  }

  if (emailSent) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("auth.checkEmail")}</CardTitle>
            <CardDescription>
              {t("auth.confirmationSentPre")}{" "}
              <strong>{confirmedEmail}</strong>.{" "}
              {t("auth.confirmationSentPost")}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            {resendStatus === "sent" && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{t("auth.resentSuccess")}</AlertDescription>
              </Alert>
            )}
            {resendStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t("auth.resentError")}</AlertDescription>
              </Alert>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendStatus === "sending" || resendStatus === "sent"}
            >
              {resendStatus === "sending" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("auth.resending")}</>
              ) : resendStatus === "sent" ? (
                <><CheckCircle2 className="mr-2 h-4 w-4" />{t("auth.emailResent")}</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />{t("auth.resendEmail")}</>
              )}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">{t("auth.backToSignIn")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t("auth.createAccount")}</CardTitle>
          <CardDescription>{t("auth.signUpDescription")}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {t(errors.email.message!)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.newPasswordPlaceholder")}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive" role="alert">
                  {t(errors.password.message!)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("auth.passwordHint")}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-label={t("auth.signUpButton")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.signingUp")}
                </>
              ) : (
                t("auth.signUpButton")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.alreadyAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("auth.signInLink")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
