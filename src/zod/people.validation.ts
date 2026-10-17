import { differenceInCalendarDays, endOfMonth, format, parseISO } from "date-fns"
import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount, toNumber } from "./formFields"

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
            (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 365),
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

export const inviteFormZodSchema = z.object({
    email: z.string().trim().pipe(z.email("Enter a valid email address")),
})

export type IInviteFormValues = z.infer<typeof inviteFormZodSchema>

// The trimmed address is the whole payload: every invite is for operations,
// so there is no role to send or to tamper with.
export const createInviteServerZodSchema = inviteFormZodSchema

export const capacityFormZodSchema = z.object({
    weekly_hours: positiveAmount("Weekly hours"),
    standard_rate_usd: optionalNonNegative("Bill rate"),
})

export type ICapacityFormValues = z.infer<typeof capacityFormZodSchema>

export const capacityServerZodSchema = capacityFormZodSchema.transform((values) => ({
    weekly_hours: Number(values.weekly_hours),
    // Zero is how the API stores "no rate". Left out, the old rate would stay.
    standard_rate_usd: toNumber(values.standard_rate_usd) ?? 0,
}))

const CLOCK_TIME = /^([01]\d|2[0-3]):[0-5]\d$/

// Blank is "not recorded", which has to stay different from midnight.
const optionalClockTime = (label: string) =>
    z.string().refine((value) => value === "" || CLOCK_TIME.test(value), `${label} must be HH:MM`)

export const attendanceFormZodSchema = z.object({
    user_id: z.string().min(1, "Choose somebody"),
    date: isoDate,
    check_in: optionalClockTime("Check-in"),
    check_out: optionalClockTime("Check-out"),
})

export type IAttendanceFormValues = z.infer<typeof attendanceFormZodSchema>

export const recordAttendanceServerZodSchema = attendanceFormZodSchema.transform((values) => ({
    user_id: values.user_id,
    date: values.date,
    // Left out when blank rather than sent as "".
    check_in: values.check_in || undefined,
    check_out: values.check_out || undefined,
}))

/**
 * Calendar days from the first day to the last, inclusive. Only a starting
 * point: weekends and half days are the agency's call, so the requester can
 * change it and their number is the one stored.
 */
export const suggestedLeaveDays = (fromDate: string, toDate: string) =>
    fromDate && toDate ? Math.max(1, differenceInCalendarDays(parseISO(toDate), parseISO(fromDate)) + 1) : 1

export const leaveRequestFormZodSchema = z.object({
    leave_type_id: z.string().min(1, "Choose a kind"),
    from_date: isoDate,
    to_date: isoDate,
    days: z.string().refine((value) => value === "" || Number(value) > 0, "Days must be a number greater than zero"),
    reason: z.string().trim().max(300, "Keep the reason under 300 characters"),
})

export type ILeaveRequestFormValues = z.infer<typeof leaveRequestFormZodSchema>

export const requestLeaveServerZodSchema = leaveRequestFormZodSchema.transform((values) => ({
    leave_type_id: values.leave_type_id,
    from_date: values.from_date,
    to_date: values.to_date,
    // Blank takes the count suggested from the dates.
    days: toNumber(values.days) ?? suggestedLeaveDays(values.from_date, values.to_date),
    reason: values.reason,
}))

export const leaveDecisionServerZodSchema = z.object({
    approve: z.boolean("Say whether it is approved"),
})
