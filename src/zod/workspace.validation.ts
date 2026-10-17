import { z } from "zod"
import { toSafeExternalUrl } from "@/lib/safeUrl"

export const credentialFormZodSchema = z.object({
    label: z.string().min(1, "Label is required"),
    client_id: z.string().optional(),
    project_id: z.string().optional(),
    url: z
        .string()
        .optional()
        .refine((value) => !value || toSafeExternalUrl(value) !== null, "Enter a full URL, including https://"),
    username: z.string().optional(),
    password: z.string().min(1, "Password is required"),
    notes: z.string().optional(),
})

export type ICredentialFormValues = z.infer<typeof credentialFormZodSchema>

// Exported apart from the refined schema below so per-field validators can reach `.shape`.
export const conversationFormFields = z.object({
    type: z.enum(["direct", "group"], { message: "Choose direct or group" }),
    name: z.string().max(120, "That name is too long"),
    member_ids: z.array(z.string()).min(1, "Choose who it is with"),
})

export const conversationFormZodSchema = conversationFormFields
    .refine((values) => values.type !== "direct" || values.member_ids.length === 1, {
        message: "A direct conversation is between you and exactly one other person",
        path: ["member_ids"],
    })
    .refine((values) => values.type !== "group" || values.name.trim() !== "", {
        message: "Give the group a name",
        path: ["name"],
    })

export type IConversationFormValues = z.infer<typeof conversationFormZodSchema>

export const messageFormZodSchema = z.object({
    body: z
        .string()
        .trim()
        .min(1, "An empty message is not a message")
        .max(4000, "That message is too long to send"),
})

// Server schemas: the form values checked again on the server and turned into
// the payloads the API's validation files expect.

// Neither a client nor a project is an agency-internal credential, which the API takes as null.
export const createCredentialServerZodSchema = credentialFormZodSchema.transform((values) => ({
    label: values.label,
    client_id: values.client_id || null,
    project_id: values.project_id || null,
    url: values.url,
    username: values.username,
    password: values.password,
    notes: values.notes,
}))

// A direct thread is named after the other person, so only a group sends a name.
export const createConversationServerZodSchema = conversationFormZodSchema.transform((values) => ({
    type: values.type,
    name: values.type === "group" ? values.name.trim() : undefined,
    member_ids: values.member_ids,
}))

// The form already holds the API's payload, trimmed.
export const sendMessageServerZodSchema = messageFormZodSchema
