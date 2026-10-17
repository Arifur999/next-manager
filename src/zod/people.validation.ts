import { z } from "zod"

// Turning a department or a kind of leave off or on again. Neither is deleted
// once in use, so this is how one is retired.
export const activeStateServerZodSchema = z.object({
    is_active: z.boolean("is_active must be true or false"),
})

export const departmentFormZodSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(60, "That is longer than a team name"),
    description: z.string().trim().max(200, "Keep it under 200 characters"),
})

export type IDepartmentFormValues = z.infer<typeof departmentFormZodSchema>

// The trimmed form values are the API payload. A blank description is sent as
// "" rather than left out, so an edit can clear it.
export const departmentServerZodSchema = departmentFormZodSchema
