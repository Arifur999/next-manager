import { CLIENT_STATUSES, LEAD_STAGES } from "@/types/crm.types"
import { z } from "zod"
import { optionalNonNegative, toNumber } from "./formFields"

// Each form schema models what the inputs hold; its server schema checks the
// same values again on the server and builds the API payload. The API drops
// unknown keys without a word, so a misnamed field would be lost, not refused.

export const clientFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    email: z.email("Enter a valid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    country: z.string().optional(),
    status: z.enum(CLIENT_STATUSES).optional(),
    notes: z.string().optional(),
})

export type IClientFormValues = z.infer<typeof clientFormZodSchema>

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

// Whether the URL is a full http(s) one is the server's call; its message
// says what to fix.
export const clientLinkFormZodSchema = z.object({
    label: z.string().trim().min(1, "Give it a name"),
    url: z.string().trim().min(1, "Enter a full URL, including https://"),
})

export type IClientLinkFormValues = z.infer<typeof clientLinkFormZodSchema>

export const createClientLinkServerZodSchema = clientLinkFormZodSchema
    .extend({ client_id: z.string().min(1, "Invalid client id") })
    .transform((values) => ({
        client_id: values.client_id,
        label: values.label,
        url: values.url,
    }))

// Renaming or repointing a link: the form already holds the payload, trimmed.
export const updateClientLinkServerZodSchema = clientLinkFormZodSchema

export const leadFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    email: z.email("Enter a valid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    // An id, not typed text: see LeadSource on the server. Blank means nobody
    // said where it came from, which is a real answer.
    source_id: z.string().optional(),
    stage: z.enum(LEAD_STAGES),
    estimated_value_usd: optionalNonNegative("Estimated value"),
    notes: z.string().max(5000, "Keep the notes under 5,000 characters").optional(),
    // Blank on a new lead makes whoever adds it the owner.
    owner_id: z.string().optional(),
})

export type ILeadFormValues = z.infer<typeof leadFormZodSchema>

export const createLeadServerZodSchema = leadFormZodSchema.transform((values) => ({
    name: values.name,
    company: values.company,
    email: values.email,
    phone: values.phone,
    // The API models "nobody said" as null, not as an empty string.
    source_id: values.source_id || null,
    stage: values.stage,
    estimated_value_usd: toNumber(values.estimated_value_usd) ?? 0,
    notes: values.notes,
    owner_id: values.owner_id || undefined,
}))

// Create and edit send the same fields; an edit that changes the stage is
// recorded in the lead's history like a move.
export const updateLeadServerZodSchema = createLeadServerZodSchema

// Moving a card to another column changes its stage and nothing else.
export const moveLeadServerZodSchema = z.object({
    stage: z.enum(LEAD_STAGES, { message: "Choose a valid stage" }),
})

// A marketplace or channel leads arrive through.
export const leadSourceFormZodSchema = z.object({
    name: z.string().trim().min(1, "Give the source a name").max(80, "Keep the name under 80 characters"),
})

export type ILeadSourceFormValues = z.infer<typeof leadSourceFormZodSchema>

export const createLeadSourceServerZodSchema = leadSourceFormZodSchema

// A rename, or turning a source off so it leaves the picker but keeps its leads' history.
export const updateLeadSourceServerZodSchema = z.object({
    name: leadSourceFormZodSchema.shape.name.optional(),
    is_active: z.boolean().optional(),
})
