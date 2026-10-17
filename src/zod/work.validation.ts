import { z } from "zod"

export const taskFormZodSchema = z.object({
    project_id: z.string().min(1, "Choose a project"),
    title: z.string().min(1, "Title is required"),
    assignee_id: z.string().optional(),
    // An id, not a word: the columns belong to the agency now.
    status_id: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    due_date: z.string().optional(),
})

export type ITaskFormValues = z.infer<typeof taskFormZodSchema>
