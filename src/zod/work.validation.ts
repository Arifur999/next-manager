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

// Server schemas: the form's values checked again on the server and keyed as
// the API's request schema expects. The API drops unknown keys without a word,
// so a misnamed field would be lost, not refused.

export const createTaskServerZodSchema = taskFormZodSchema.transform((values) => ({
    project_id: values.project_id,
    title: values.title,
    assignee_id: values.assignee_id || null,
    // A blank id is an invalid id to the API, not a missing one. Left out, the
    // task lands on the board's default column, which is what an untouched
    // picker means.
    status_id: values.status_id || undefined,
    priority: values.priority,
    due_date: values.due_date || null,
}))

// Ticking a task done moves it to another column and changes nothing else.
// Operations may only change the status of their own tasks, and the API
// refuses any other key from them.
export const moveTaskServerZodSchema = z.object({
    status_id: z.string().min(1, "Choose a column"),
})
