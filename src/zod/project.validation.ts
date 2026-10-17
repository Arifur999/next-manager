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
