import { z } from "zod"

// Field rules shared by the form schemas.
//
// Money and rate fields are STRINGS: an <input> hands back a string whatever
// its type attribute says, so the form schema models what the input holds and
// each server schema turns it into a number once, at submit.

/** A string that has to read as a number greater than zero. */
export const positiveAmount = (label: string) =>
    z
        .string()
        .min(1, `${label} is required`)
        .refine((value) => Number.isFinite(Number(value)), `${label} must be a number`)
        .refine((value) => Number(value) > 0, `${label} must be greater than zero`)

/** Same, but zero is allowed and blank means "not given". */
export const optionalNonNegative = (label: string) =>
    z
        .string()
        .optional()
        .refine(
            (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
            `${label} must be a number that is not negative`,
        )

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")

// The API's rule for any password somebody chooses: sign-up, a change, a reset,
// an invite accepted. The forms show NEW_PASSWORD_RULES before anyone types.
export const NEW_PASSWORD_RULES = "At least 8 characters, with a letter and a number."

export const newPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number")

// "Email is required" when empty, then "Enter a valid email address".
export const requiredEmail = z.string().min(1, "Email is required").pipe(z.email("Enter a valid email address"))

/** "" and undefined both become undefined; anything else becomes a number. */
export const toNumber = (value: string | undefined): number | undefined =>
    value === undefined || value === "" ? undefined : Number(value)

// Retiring a record and bringing it back. What is already in use (a sold
// service, a staffed department, a paid shareholder) is never deleted, so this
// switch is how it leaves the lists.
export const activeStateServerZodSchema = z.object({
    is_active: z.boolean("is_active must be true or false"),
})
