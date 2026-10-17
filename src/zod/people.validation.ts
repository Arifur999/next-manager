import { z } from "zod"
import { toNumber } from "./formFields"

// Turning a department or a kind of leave off or on again. Neither is deleted
// once in use, so this is how one is retired.
export const activeStateServerZodSchema = z.object({
    is_active: z.boolean("is_active must be true or false"),
})

export const departmentFormZodSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(60, "That is longer than a team name"),
    description: z.string().trim().max(200, "Keep it under 200 characters"),
})

export type IDepartmentFormValues = z.infer<typeof departmentFormZodSchema>

// The trimmed form values are the API payload. A blank description is sent as
// "" rather than left out, so an edit can clear it.
export const departmentServerZodSchema = departmentFormZodSchema

export const leaveTypeFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give it a name").max(60, "Keep the name under 60 characters"),
    days_per_year: z
        .string()
        .refine(
            (value) => /^\d*$/.test(value) && Number(value) <= 365,
            "Days a year must be a whole number from 0 to 365",
        ),
    is_paid: z.boolean(),
})

export type ILeaveTypeFormValues = z.infer<typeof leaveTypeFormZodSchema>

export const leaveTypeServerZodSchema = leaveTypeFormZodSchema.transform((values) => ({
    name: values.name,
    // Blank is zero, which means tracked but not capped rather than none left.
    days_per_year: toNumber(values.days_per_year) ?? 0,
    is_paid: values.is_paid,
}))
