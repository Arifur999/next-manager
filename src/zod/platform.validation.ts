import { z } from "zod"
import { SUBSCRIPTION_STATUSES } from "@/types/platform.types"
import { newPassword } from "./auth.validation"
import { optionalNonNegative, toNumber } from "./formFields"

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
