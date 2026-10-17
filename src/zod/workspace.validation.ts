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
