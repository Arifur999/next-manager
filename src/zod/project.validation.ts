import { z } from "zod"
import { optionalNonNegative } from "./formFields"

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
