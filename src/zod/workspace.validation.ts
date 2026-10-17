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
