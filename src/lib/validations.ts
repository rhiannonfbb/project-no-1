import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required."),
})

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>

export const ideaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(100, "Title must be at most 100 characters."),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(2000, "Description must be at most 2000 characters."),
})

export type IdeaFormValues = z.infer<typeof ideaSchema>
