import { z } from "zod"

/**
 * Form schemas.
 *
 * Money and rate fields are STRINGS here, not numbers. An `<input>` hands back
 * a string whatever its type attribute says, so modelling them as numbers meant
 * the schema's input type and the field's actual value disagreed — TanStack
 * Form catches that at compile time, and `z.coerce.number()` only hides it by
 * accepting `unknown`.
 *
 * They are parsed to numbers once, at submit, by toNumber() below. That keeps
 * one conversion point instead of one per field.
 */

/** A string that has to read as a number greater than zero. */
const positiveAmount = (label: string) =>
    z
        .string()
        .min(1, `${label} is required`)
        .refine((value) => Number.isFinite(Number(value)), `${label} must be a number`)
        .refine((value) => Number(value) > 0, `${label} must be greater than zero`)

/** Same, but zero is allowed and blank means "not given". */
const optionalNonNegative = (label: string) =>
    z
        .string()
        .optional()
        .refine(
            (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
            `${label} must be a number that is not negative`,
        )

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")

/** "" and undefined both become undefined; anything else becomes a number. */
export const toNumber = (value: string | undefined): number | undefined =>
    value === undefined || value === "" ? undefined : Number(value)

export const accountFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["paypal", "payoneer", "stripe", "wise", "bank", "cash", "bkash", "nagad", "other"], {
        message: "Choose a type",
    }),
    // Fixed at creation and never editable: changing it would reinterpret every
    // ledger row already written against the account.
    currency: z.enum(["USD", "BDT"], { message: "Choose a currency" }),
    opening_balance: optionalNonNegative("Opening balance"),
    notes: z.string().optional(),
})

export type IAccountFormValues = z.infer<typeof accountFormZodSchema>

export const clientFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(["active", "inactive", "archived"]).optional(),
    notes: z.string().optional(),
})

export type IClientFormValues = z.infer<typeof clientFormZodSchema>

export const paymentFormZodSchema = z.object({
    client_id: z.string().min(1, "Choose a client"),
    project_id: z.string().optional(),
    invoice_id: z.string().optional(),
    date: isoDate,
    amount_usd: positiveAmount("Amount"),
    // Blank means "use the agency default or the latest fetched rate", which
    // the server resolves.
    reporting_rate: optionalNonNegative("Rate"),
    account_id: z.string().min(1, "Choose a USD account"),
    reference: z.string().optional(),
    notes: z.string().optional(),
})

export type IPaymentFormValues = z.infer<typeof paymentFormZodSchema>

export const exchangeFormZodSchema = z
    .object({
        date: isoDate,
        from_account_id: z.string().min(1, "Choose the USD account"),
        to_account_id: z.string().min(1, "Choose the BDT account"),
        amount_usd: positiveAmount("Amount"),
        // Required, never defaulted from the API: this figure exists to record
        // what the processor actually paid, and mid-market would be wrong every
        // single time.
        rate: positiveAmount("Rate"),
        fee_usd: optionalNonNegative("Fee"),
        notes: z.string().optional(),
    })
    .refine((values) => Number(values.fee_usd || 0) < Number(values.amount_usd), {
        message: "The fee cannot be equal to or larger than the amount",
        path: ["fee_usd"],
    })

export type IExchangeFormValues = z.infer<typeof exchangeFormZodSchema>

export const expenseFormZodSchema = z.object({
    date: isoDate,
    category_id: z.string().min(1, "Choose a category"),
    amount_bdt: positiveAmount("Amount"),
    account_id: z.string().min(1, "Choose a BDT account"),
    project_id: z.string().optional(),
    vendor: z.string().optional(),
    notes: z.string().optional(),
})

export type IExpenseFormValues = z.infer<typeof expenseFormZodSchema>

export const expenseCategoryFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["general", "employee"], { message: "Choose a type" }),
    monthly_budget: optionalNonNegative("Monthly budget"),
})

export type IExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormZodSchema>
