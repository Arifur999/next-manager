import { z } from "zod"

export const clientFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    email: z.email("Enter a valid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(["active", "inactive", "archived"]).optional(),
    notes: z.string().optional(),
})

export type IClientFormValues = z.infer<typeof clientFormZodSchema>

// Whether the URL is a full http(s) one is the server's call; its message
// says what to fix.
export const clientLinkFormZodSchema = z.object({
    label: z.string().trim().min(1, "Give it a name"),
    url: z.string().trim().min(1, "Enter a full URL, including https://"),
})

export type IClientLinkFormValues = z.infer<typeof clientLinkFormZodSchema>

// Server schemas: the form's values checked again on the server and keyed as
// the API's request schema expects. The API drops unknown keys without a word,
// so a misnamed field would be lost, not refused.

// Create and edit send the same fields.
export const clientServerZodSchema = clientFormZodSchema.transform((values) => ({
    name: values.name,
    company: values.company,
    email: values.email,
    phone: values.phone,
    country: values.country,
    status: values.status,
    notes: values.notes,
}))

export const createClientLinkServerZodSchema = clientLinkFormZodSchema
    .extend({ client_id: z.string().min(1, "Invalid client id") })
    .transform((values) => ({
        client_id: values.client_id,
        label: values.label,
        url: values.url,
    }))
