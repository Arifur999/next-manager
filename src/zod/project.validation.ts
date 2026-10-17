import { z } from "zod"
import { optionalNonNegative, toNumber } from "./formFields"

export const projectFormZodSchema = z.object({
    client_id: z.string().min(1, "Choose a client"),
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    // An id, not a word from a fixed list: the columns are the agency's now.
    status_id: z.string().min(1, "Choose a status"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    contract_value_usd: optionalNonNegative("Contract value"),
    description: z.string().optional(),
    notes: z.string().optional(),
})

export type IProjectFormValues = z.infer<typeof projectFormZodSchema>

// Server schemas: the form's values checked again on the server and keyed as
// the API's request schema expects. The API drops unknown keys without a word,
// so a misnamed field would be lost, not refused.

const toProjectPayload = (values: IProjectFormValues) => ({
    client_id: values.client_id,
    name: values.name,
    status_id: values.status_id,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    contract_value_usd: toNumber(values.contract_value_usd) ?? 0,
    description: values.description,
    notes: values.notes,
})

export const createProjectServerZodSchema = projectFormZodSchema.transform((values) => ({
    ...toProjectPayload(values),
    code: values.code,
}))

// The code is fixed after creation and the API drops it on update, so sending
// it would only look like an edit.
export const updateProjectServerZodSchema = projectFormZodSchema.transform(toProjectPayload)

// Assigning somebody already on the project updates their role, which is how
// a role gets changed.
export const projectMemberFormZodSchema = z.object({
    user_id: z.string().min(1, "Choose someone"),
    role_on_project: z.string().optional(),
})

export type IProjectMemberFormValues = z.infer<typeof projectMemberFormZodSchema>

export const assignProjectMemberServerZodSchema = projectMemberFormZodSchema
    .extend({ project_id: z.string().min(1, "Invalid project id") })
    .transform((values) => ({
        project_id: values.project_id,
        user_id: values.user_id,
        role_on_project: values.role_on_project,
    }))

// Whether the URL is a full http(s) one is the server's call; its message
// says what to fix.
export const projectLinkFormZodSchema = z.object({
    label: z.string().trim().min(1, "Give it a name"),
    url: z.string().trim().min(1, "Enter a full URL, including https://"),
})

export type IProjectLinkFormValues = z.infer<typeof projectLinkFormZodSchema>

export const createProjectLinkServerZodSchema = projectLinkFormZodSchema
    .extend({ project_id: z.string().min(1, "Invalid project id") })
    .transform((values) => ({
        project_id: values.project_id,
        label: values.label,
        url: values.url,
    }))
