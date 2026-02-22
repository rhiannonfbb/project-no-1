import { z } from "zod"

// Error messages are i18n keys — call t(error.message) when displaying them in components.
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "auth.errorEmailRequired" })
    .email({ message: "auth.errorValidEmail" }),
  password: z
    .string()
    .min(1, { message: "auth.errorPasswordRequired" }),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, { message: "auth.errorEmailRequired" })
    .email({ message: "auth.errorValidEmail" }),
  password: z
    .string()
    .min(8, { message: "auth.errorPasswordLength" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>

export const ideaSchema = z.object({
  title: z
    .string()
    .min(1, { message: "validation.titleRequired" })
    .max(100, { message: "validation.titleMax" }),
  description: z
    .string()
    .min(1, { message: "validation.descriptionRequired" })
    .max(2000, { message: "validation.descriptionMax" }),
})

export type IdeaFormValues = z.infer<typeof ideaSchema>
