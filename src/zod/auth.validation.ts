import { z } from "zod"

export const loginFormZodSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type ILoginFormValues = z.infer<typeof loginFormZodSchema>

/**
 * Signing up creates a COMPANY, not just an account.
 *
 * organization_name was missing here while the API has always required it, so
 * this schema could never have produced a request the server accepts. Whoever
 * signs up becomes that company's first admin - there is no role field,
 * because a form that let you pick your own role is not an access control.
 */
export const registerFormZodSchema = z.object({
  organization_name: z.string().min(1, "Company name is required"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
})

export type IRegisterFormValues = z.infer<typeof registerFormZodSchema>

export const changePasswordFormZodSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
})

export type IChangePasswordFormValues = z.infer<typeof changePasswordFormZodSchema>
