import { endOfMonth, format, parseISO } from "date-fns"
import { z } from "zod"
import { optionalNonNegative, toNumber } from "./formFields"

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

export const payrollMonthFormZodSchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Pick a month"),
})

export const createPayrollRunServerZodSchema = payrollMonthFormZodSchema.transform(({ month }) => {
    // Local midnight on the 1st, so the period is the month picked in any time zone.
    const firstDay = parseISO(`${month}-01`)
    return {
        period_start: format(firstDay, "yyyy-MM-dd"),
        period_end: format(endOfMonth(firstDay), "yyyy-MM-dd"),
    }
})

export const payrollItemsFormZodSchema = z.object({
    items: z
        .array(
            z.object({
                id: z.string().min(1, "Invalid payroll line"),
                gross_bdt: optionalNonNegative("Gross"),
                deductions_bdt: optionalNonNegative("Deductions"),
            }),
        )
        .min(1, "Nothing to save"),
})

export type IPayrollItemFormValues = z.infer<typeof payrollItemsFormZodSchema>["items"][number]

export const setPayrollItemsServerZodSchema = payrollItemsFormZodSchema.transform(({ items }) => ({
    // A blank box is zero, the same figure a new line starts at.
    items: items.map((item) => ({
        id: item.id,
        gross_bdt: toNumber(item.gross_bdt) ?? 0,
        deductions_bdt: toNumber(item.deductions_bdt) ?? 0,
    })),
}))

export const completePayrollServerZodSchema = z.object({
    account_id: z.string().min(1, "Choose the account the salaries are paid from"),
})
