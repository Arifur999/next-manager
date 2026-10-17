import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount, toNumber } from "./formFields"

// A blank quantity bills one unit and a blank price bills nothing, which is
// what the form has always sent; only values the API would refuse fail here.
const invoiceItemFormZodSchema = z.object({
    description: z.string().min(1, "Describe the line"),
    quantity: optionalNonNegative("Quantity"),
    unit_price: optionalNonNegative("Unit price"),
})

// No total field: the server works it out from the lines, and its figure is
// the one that lands in receivables.
export const invoiceFormZodSchema = z.object({
    client_id: z.string().min(1, "Choose a client"),
    project_id: z.string().optional(),
    issue_date: isoDate,
    due_date: isoDate,
    discount: optionalNonNegative("Discount"),
    tax: optionalNonNegative("Tax"),
    notes: z.string().optional(),
    items: z.array(invoiceItemFormZodSchema).min(1, "Add at least one line"),
})

export type IInvoiceFormValues = z.infer<typeof invoiceFormZodSchema>

// Server schemas: the form's string values, checked again on the server and
// turned into the payload the API's request schema expects.
export const createInvoiceServerZodSchema = invoiceFormZodSchema.transform((values) => ({
    client_id: values.client_id,
    project_id: values.project_id || null,
    issue_date: values.issue_date,
    due_date: values.due_date,
    discount: toNumber(values.discount) ?? 0,
    tax: toNumber(values.tax) ?? 0,
    notes: values.notes,
    // An invoice made here goes out as it is saved; there is no draft step.
    status: "sent",
    items: values.items.map((item, index) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || 0,
        sort_order: index,
    })),
}))

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

export const createPaymentServerZodSchema = paymentFormZodSchema.transform((values) => ({
    client_id: values.client_id,
    project_id: values.project_id || null,
    invoice_id: values.invoice_id || null,
    date: values.date,
    amount_usd: Number(values.amount_usd),
    reporting_rate: toNumber(values.reporting_rate),
    account_id: values.account_id,
    reference: values.reference,
    notes: values.notes,
}))
