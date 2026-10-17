import { z } from "zod"
import { ANNOUNCEMENT_AUDIENCES, PLATFORM_PERMISSIONS, SUBSCRIPTION_STATUSES } from "@/types/platform.types"
import { newPassword } from "./formFields"
import { isoDate, optionalNonNegative, positiveAmount, toNumber } from "./formFields"

// Number fields are strings here, as in formFields.ts: the form schema models
// what the input holds and each server schema turns it into the API payload.

const isBlank = (value: string) => value.trim() === ""

const isWholeNumberBetween = (value: string, min: number, max = Number.MAX_SAFE_INTEGER) => {
    const number = Number(value)
    return Number.isInteger(number) && number >= min && number <= max
}

// Blank is unlimited, which the API takes as null. Zero is refused there: a plan
// nobody can add anybody to is not a plan.
const planLimit = (label: string) =>
    z
        .string()
        .refine(
            (value) => isBlank(value) || isWholeNumberBetween(value, 1),
            `${label} must be a whole number above zero - leave it empty for unlimited`,
        )

const toPlanLimit = (value: string) => (isBlank(value) ? null : Number(value))

export const planFormZodSchema = z.object({
    // Lowercased before it is checked, so "Agency_Pro" is taken as agency_pro.
    code: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Code is required")
        .regex(/^[a-z0-9_]+$/, "Code must be lowercase letters, numbers and underscores"),
    name: z.string().trim().min(1, "Name is required"),
    price_usd: optionalNonNegative("Price"),
})

export type IPlanFormValues = z.infer<typeof planFormZodSchema>

export const planLimitsFormZodSchema = z.object({
    price_usd: optionalNonNegative("Price"),
    max_seats: planLimit("Seats"),
    max_projects: planLimit("Projects"),
})

export type IPlanLimitsFormValues = z.infer<typeof planLimitsFormZodSchema>

export const subscriptionFormZodSchema = z.object({
    plan_id: z.string().min(1, "Choose a plan"),
    status: z.enum(SUBSCRIPTION_STATUSES, { message: "Choose a status" }),
})

export type ISubscriptionFormValues = z.infer<typeof subscriptionFormZodSchema>

export const companyFormZodSchema = z.object({
    name: z.string().trim().min(1, "Company name is required"),
    admin_name: z.string().trim().min(1, "The admin's name is required"),
    admin_email: z
        .string()
        .trim()
        .min(1, "The admin's email is required")
        .pipe(z.email("Enter a valid email address for the admin")),
    admin_password: newPassword,
    // Empty means the cheapest active plan, which the API picks when none is sent.
    plan_id: z.string(),
    // Empty means no trial: a company provisioned by hand has usually agreed to pay.
    trial_days: z
        .string()
        .trim()
        .refine(
            (value) => isBlank(value) || isWholeNumberBetween(value, 1, 365),
            "A trial is a whole number of days, from 1 to 365",
        ),
})

export type ICompanyFormValues = z.infer<typeof companyFormZodSchema>

export const agencyInviteFormZodSchema = z.object({
    email: z.string().trim().min(1, "Email is required").pipe(z.email("A valid email is required")),
    // Empty lets the owner name their own agency on the way in.
    company_name: z.string().trim().max(120, "That is longer than a name"),
    // Empty means whatever new sign-ups get, from the platform settings.
    plan_id: z.string(),
    trial_days: z
        .string()
        .trim()
        .refine(
            (value) => isBlank(value) || isWholeNumberBetween(value, 0, 365),
            "A trial is a whole number of days, from 0 to 365",
        ),
})

export type IAgencyInviteFormValues = z.infer<typeof agencyInviteFormZodSchema>

export const announcementFormZodSchema = z.object({
    title: z.string().trim().min(1, "Give it a title").max(120, "A title longer than this is a body"),
    body: z.string().trim().min(1, "Say something"),
    audience: z.enum(ANNOUNCEMENT_AUDIENCES, { message: "Pick who this is for" }),
    send_email: z.boolean(),
})

export type IAnnouncementFormValues = z.infer<typeof announcementFormZodSchema>

// USD, like subscription revenue, so net profit subtracts like for like.
export const platformExpenseFormZodSchema = z.object({
    date: isoDate,
    description: z.string().trim().min(1, "Say what it was for"),
    category: z.string().trim(),
    amount_usd: positiveAmount("Amount"),
})

export type IPlatformExpenseFormValues = z.infer<typeof platformExpenseFormZodSchema>

export const platformSettingsFormZodSchema = z.object({
    product_name: z
        .string()
        .trim()
        .min(1, "The product needs a name")
        .max(60, "That will not fit in an email subject line"),
    // Empty says nothing at all, which beats an address nobody reads.
    support_email: z
        .string()
        .trim()
        .pipe(z.union([z.literal(""), z.email("That is not a valid email address")])),
    // Empty leaves new sign-ups unprovisioned until somebody sets them up by hand.
    default_plan_id: z.string(),
    default_trial_days: z
        .string()
        .trim()
        .refine((value) => isWholeNumberBetween(value, 0, 365), "A trial is a whole number of days, from 0 to 365"),
})

export type IPlatformSettingsFormValues = z.infer<typeof platformSettingsFormZodSchema>

// An empty list means full access, not none: the hatch that stops the first
// operator locking themselves out.
const platformPermissions = z.array(z.enum(PLATFORM_PERMISSIONS, { message: "Unknown permission" }))

export const platformInviteFormZodSchema = z.object({
    email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
    // At least one, so an untouched form can never invite somebody with everything.
    permissions: platformPermissions.min(
        1,
        "Choose what they may do - an operator with nothing chosen would get everything",
    ),
})

export type IPlatformInviteFormValues = z.infer<typeof platformInviteFormZodSchema>

// Server schemas: the form values checked again on the server and turned into
// the payloads platform.validation.ts on the API expects.

// An empty price is a free plan, on create and on edit.
export const createPlanServerZodSchema = planFormZodSchema.transform((values) => ({
    code: values.code,
    name: values.name,
    price_usd: toNumber(values.price_usd) ?? 0,
}))

export const updatePlanServerZodSchema = planLimitsFormZodSchema.transform((values) => ({
    price_usd: toNumber(values.price_usd) ?? 0,
    max_seats: toPlanLimit(values.max_seats),
    max_projects: toPlanLimit(values.max_projects),
}))

// The form already holds the API's payload.
export const setSubscriptionServerZodSchema = subscriptionFormZodSchema

export const createCompanyServerZodSchema = companyFormZodSchema.transform((values) => ({
    name: values.name,
    admin_name: values.admin_name,
    admin_email: values.admin_email,
    admin_password: values.admin_password,
    plan_id: values.plan_id || undefined,
    trial_days: toNumber(values.trial_days),
}))

export const agencyInviteServerZodSchema = agencyInviteFormZodSchema.transform((values) => ({
    email: values.email,
    company_name: values.company_name || undefined,
    plan_id: values.plan_id || undefined,
    // An emptied box is no trial, as it was when the field held a number.
    trial_days: toNumber(values.trial_days) ?? 0,
}))

// Saving a draft and editing one send the same fields.
export const announcementServerZodSchema = announcementFormZodSchema

export const platformExpenseServerZodSchema = platformExpenseFormZodSchema.transform((values) => ({
    date: values.date,
    description: values.description,
    category: values.category,
    amount_usd: Number(values.amount_usd),
}))

export const platformSettingsServerZodSchema = platformSettingsFormZodSchema.transform((values) => ({
    product_name: values.product_name,
    support_email: values.support_email,
    default_plan_id: values.default_plan_id || null,
    default_trial_days: Number(values.default_trial_days),
}))

export const platformAccessServerZodSchema = platformPermissions

// The form already holds the API's payload.
export const platformInviteServerZodSchema = platformInviteFormZodSchema
