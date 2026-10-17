import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount } from "./formFields"

const invoiceItemFormZodSchema = z.object({
    description: z.string().min(1, "Describe the line"),
    quantity: z.string().min(1, "Qty"),
    unit_price: z.string().min(1, "Price"),
})

// No total field: the server works it out from the lines, and its figure is
// the one that lands in receivables.
export const invoiceFormZodSchema = z.object({
    client_id: z.string().min(1, "Choose a client"),
    project_id: z.string().optional(),
    issue_date: isoDate,
    due_date: isoDate,
    discount: z.string().optional(),
    tax: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(invoiceItemFormZodSchema).min(1, "Add at least one line"),
})

export type IInvoiceFormValues = z.infer<typeof invoiceFormZodSchema>

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
