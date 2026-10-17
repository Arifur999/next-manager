import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount } from "./formFields"

export { toNumber } from "./formFields"

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

// The plain object is exported alongside the refined schema so per-field
// validators can reach `.shape`. Refining returns a wrapper without one, and
// digging into its internals to get at the original is the kind of thing that
// breaks silently on a Zod upgrade.
export const exchangeFormFields = z.object({
    date: isoDate,
    from_account_id: z.string().min(1, "Choose the USD account"),
    to_account_id: z.string().min(1, "Choose the BDT account"),
    amount_usd: positiveAmount("Amount"),
    // Required, never defaulted from the API: this figure exists to record what
    // the processor actually paid, and mid-market would be wrong every time.
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
