import { z } from "zod"

// The API's rule for any password somebody chooses: sign-up, a change, a reset,
// an invite accepted.
export const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number")

// "Email is required" when empty, then "Enter a valid email address".
export const requiredEmail = z.string().min(1, "Email is required").pipe(z.email("Enter a valid email address"))

export const loginFormZodSchema = z.object({
  email: requiredEmail,
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
  email: requiredEmail,
  phone: z.string().optional(),
  password: newPassword,
})

export type IRegisterFormValues = z.infer<typeof registerFormZodSchema>

// The three fields a person may change about themselves, minus the avatar,
// which has no field yet. Email is the login and role is an admin's call.
export const profileFormZodSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim(),
})

export type IProfileFormValues = z.infer<typeof profileFormZodSchema>

export const changePasswordFormZodSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: newPassword,
})

export type IChangePasswordFormValues = z.infer<typeof changePasswordFormZodSchema>

export const forgotPasswordFormZodSchema = z.object({
  email: requiredEmail,
})

export type IForgotPasswordFormValues = z.infer<typeof forgotPasswordFormZodSchema>

export const resetPasswordFormZodSchema = z.object({
  // Carried from the URL rather than typed. Present here so the payload has
  // one shape the form and the action both agree on.
  token: z.string().min(1, "This reset link is incomplete"),
  new_password: newPassword,
})

export type IResetPasswordFormValues = z.infer<typeof resetPasswordFormZodSchema>

// Server schemas: the form values checked again on the server. The API's
// updateMe schema is strict, so a key outside it would be refused, not dropped.
export const updateProfileServerZodSchema = profileFormZodSchema

// The confirmation field is the form's own check and never leaves the browser.
export const changePasswordServerZodSchema = changePasswordFormZodSchema
