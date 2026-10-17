import { z } from "zod"
import { newPassword, requiredEmail } from "./formFields"

export const loginFormZodSchema = z.object({
  email: requiredEmail,
  password: z.string().min(1, "Password is required"),
})

export type ILoginFormValues = z.infer<typeof loginFormZodSchema>

/**
 * Signing up creates a COMPANY, not just an account, so the company name is
 * required. Whoever signs up becomes its first admin: there is no role field,
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

// Accepting an invite. There is no email field: the address comes from the
// invite server-side, so a leaked link cannot open an account under another one.
export const joinFormZodSchema = z.object({
  full_name: z.string().min(1, "Your name is required"),
  password: newPassword,
})

export type IJoinFormValues = z.infer<typeof joinFormZodSchema>

export const agencyJoinFormZodSchema = joinFormZodSchema.extend({
  // Only read when the invite carries no name; one agreed with the deal stays.
  company_name: z.string().min(1, "Your agency needs a name").max(120, "That is longer than a name"),
})

export type IAgencyJoinFormValues = z.infer<typeof agencyJoinFormZodSchema>

// Server schemas: the form values checked again on the server. The API's
// updateMe schema is strict, so a key outside it would be refused, not dropped.
export const updateProfileServerZodSchema = profileFormZodSchema

// The confirmation field is the form's own check and never leaves the browser.
export const changePasswordServerZodSchema = changePasswordFormZodSchema

// An empty phone is left out rather than stored as a phone number of "".
export const registerServerZodSchema = registerFormZodSchema.transform((values) => ({
  organization_name: values.organization_name,
  full_name: values.full_name,
  email: values.email,
  phone: values.phone?.trim() || undefined,
  password: values.password,
}))

export type IRegisterPayload = z.output<typeof registerServerZodSchema>

// The form already holds the API's payload.
export const forgotPasswordServerZodSchema = forgotPasswordFormZodSchema

// The token from the link and the new password, nothing else.
export const resetPasswordServerZodSchema = resetPasswordFormZodSchema

// A name and a password; the email and the company come from the invite.
export const joinServerZodSchema = joinFormZodSchema

export const agencyJoinServerZodSchema = agencyJoinFormZodSchema

// The form already holds the API's payload.
export const loginServerZodSchema = loginFormZodSchema
