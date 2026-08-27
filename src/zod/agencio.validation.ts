import { z } from "zod"

// Shared field builders, so a rule that matters is written once. A money field
// that accepts a negative or an empty string somewhere is how a bad figure gets
// into the ledger.
const positiveAmount = (label: string) =>
  z.coerce
    .number({ message: `${label} must be a number` })
    .positive(`${label} must be greater than zero`)

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")

export const accountFormZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["paypal", "payoneer", "stripe", "wise", "bank", "cash", "bkash", "nagad", "other"], {
    message: "Choose a type",
  }),
  // Fixed at creation and never editable: changing it would reinterpret every
  // ledger row already written against the account.
  currency: z.enum(["USD", "BDT"], { message: "Choose a currency" }),
  opening_balance: z.coerce.number({ message: "Opening balance must be a number" }).optional(),
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
  // Optional: the server fills in the agency's default or the latest fetched
  // rate when this is left blank.
  reporting_rate: z.coerce.number().positive("Rate must be greater than zero").optional(),
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
    // Required, never defaulted from the API: this figure exists to record what
    // the processor actually paid, and mid-market would be wrong every time.
    rate: positiveAmount("Rate"),
    fee_usd: z.coerce.number().nonnegative("Fee cannot be negative").optional(),
    notes: z.string().optional(),
  })
  .refine((values) => (values.fee_usd ?? 0) < values.amount_usd, {
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
  monthly_budget: z.coerce.number().nonnegative().optional(),
})

export type IExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormZodSchema>
