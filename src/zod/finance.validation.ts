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
