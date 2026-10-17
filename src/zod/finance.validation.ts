import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount, toNumber } from "./formFields"

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

// Server schemas: the form's string values, checked again on the server and
// turned into the payload the API's request schema expects.
export const createAccountServerZodSchema = accountFormZodSchema.transform((values) => ({
    name: values.name,
    type: values.type,
    currency: values.currency,
    // A blank opening balance is an empty wallet.
    opening_balance: toNumber(values.opening_balance) ?? 0,
    notes: values.notes,
}))

// Renaming is the one edit an account takes here: its currency is fixed and its
// opening balance is history, and the API accepts neither on an update.
export const accountRenameFormZodSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120, "Keep the name under 120 characters"),
})

export type IAccountRenameFormValues = z.infer<typeof accountRenameFormZodSchema>

// Exported beside the refined schema so per-field validators can reach
// `.shape`; a refined schema has none.
export const exchangeFormFields = z.object({
    date: isoDate,
    from_account_id: z.string().min(1, "Choose the USD account"),
    to_account_id: z.string().min(1, "Choose the BDT account"),
    amount_usd: positiveAmount("Amount"),
    // Required, never defaulted from the API: this records what the processor
    // actually paid, and mid-market would be wrong every time.
    rate: positiveAmount("Rate"),
    fee_usd: optionalNonNegative("Fee"),
    notes: z.string().optional(),
})

export const exchangeFormZodSchema = exchangeFormFields.refine(
    (values) => Number(values.fee_usd || 0) < Number(values.amount_usd),
    {
        message: "The fee cannot be equal to or larger than the amount",
        path: ["fee_usd"],
    },
)

export type IExchangeFormValues = z.infer<typeof exchangeFormZodSchema>

export const createExchangeServerZodSchema = exchangeFormZodSchema.transform((values) => ({
    date: values.date,
    from_account_id: values.from_account_id,
    to_account_id: values.to_account_id,
    amount_usd: Number(values.amount_usd),
    rate: Number(values.rate),
    fee_usd: toNumber(values.fee_usd) ?? 0,
    notes: values.notes,
}))

export const loanFormZodSchema = z.object({
    lender: z.string().trim().min(1, "Say who lent it").max(120, "Keep the lender under 120 characters"),
    principal_bdt: positiveAmount("Amount"),
    interest_rate: optionalNonNegative("Rate"),
    started_on: isoDate,
    term_months: z
        .string()
        .refine(
            (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 600,
            "Months must be a whole number from 1 to 600",
        ),
    // Blank on purpose for a loan entered after the fact: that money never
    // landed in an account here, and picking one would invent it.
    account_id: z.string().optional(),
})

export type ILoanFormValues = z.infer<typeof loanFormZodSchema>

export const createLoanServerZodSchema = loanFormZodSchema.transform((values) => ({
    lender: values.lender,
    principal_bdt: Number(values.principal_bdt),
    interest_rate: toNumber(values.interest_rate) ?? 0,
    started_on: values.started_on,
    term_months: Number(values.term_months),
    // The API takes no null here, only an id or nothing.
    account_id: values.account_id || undefined,
}))

export const payInstalmentServerZodSchema = z.object({
    account_id: z.string().min(1, "Choose the account it is paid from"),
})

export const shareholderFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give them a name").max(120, "Keep the name under 120 characters"),
    // The 100% ceiling across everybody still active is the server's to check.
    share_pct: optionalNonNegative("Share").refine(
        (value) => !value || Number(value) <= 100,
        "Nobody owns more than all of it",
    ),
})

export type IShareholderFormValues = z.infer<typeof shareholderFormZodSchema>

export const createShareholderServerZodSchema = shareholderFormZodSchema.transform((values) => ({
    name: values.name,
    share_pct: toNumber(values.share_pct) ?? 0,
}))

export const distributionFormZodSchema = z.object({
    shareholder_id: z.string().min(1, "Choose who it is paid to"),
    date: isoDate,
    amount_bdt: positiveAmount("Amount"),
    account_id: z.string().min(1, "Choose the account it is paid from"),
})

export type IDistributionFormValues = z.infer<typeof distributionFormZodSchema>

export const createDistributionServerZodSchema = distributionFormZodSchema.transform((values) => ({
    shareholder_id: values.shareholder_id,
    date: values.date,
    amount_bdt: Number(values.amount_bdt),
    account_id: values.account_id,
}))

// Only checks that it reads as a number: the API owns the sanity range and
// says "That rate looks wrong" itself.
export const defaultRateFormZodSchema = z.object({
    default_usd_rate: z
        .string()
        .trim()
        .refine((value) => value === "" || Number.isFinite(Number(value)), "That is not a number"),
})

export type IDefaultRateFormValues = z.infer<typeof defaultRateFormZodSchema>

export const setDefaultRateServerZodSchema = defaultRateFormZodSchema.transform((values) => ({
    // Blank clears the agency's own rate, and reports go back to the market rate.
    default_usd_rate: values.default_usd_rate === "" ? null : Number(values.default_usd_rate),
}))
