import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount } from "./formFields"

export { toNumber } from "./formFields"

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
