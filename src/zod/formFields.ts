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

/** "" and undefined both become undefined; anything else becomes a number. */
export const toNumber = (value: string | undefined): number | undefined =>
    value === undefined || value === "" ? undefined : Number(value)
