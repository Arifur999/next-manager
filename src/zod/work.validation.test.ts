import { describe, expect, it } from "vitest"
import { createTaskServerZodSchema, moveTaskServerZodSchema } from "./work.validation"

const validTask = {
    project_id: "p1",
    title: "Ship the pricing page",
    assignee_id: "u1",
    status_id: "s1",
    priority: "high",
    due_date: "2026-10-30",
}

describe("createTaskServerZodSchema", () => {
    it("builds the API payload from the form values", () => {
        expect(createTaskServerZodSchema.parse(validTask)).toEqual(validTask)
    })

    it("sends a blank assignee and due date as null and leaves a blank status out", () => {
        const payload = createTaskServerZodSchema.parse({ ...validTask, assignee_id: "", status_id: "", due_date: "" })
        expect(payload.assignee_id).toBeNull()
        expect(payload.due_date).toBeNull()
        expect(payload.status_id).toBeUndefined()
    })

    it("requires a project and a title", () => {
        const result = createTaskServerZodSchema.safeParse({ ...validTask, project_id: "", title: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual(["Choose a project", "Title is required"])
    })

    it("rejects a priority the API does not know", () => {
        expect(createTaskServerZodSchema.safeParse({ ...validTask, priority: "critical" }).success).toBe(false)
    })
})

describe("moveTaskServerZodSchema", () => {
    it("sends the status and nothing else", () => {
        expect(moveTaskServerZodSchema.parse({ status_id: "s2", due_date: "2026-12-01" })).toEqual({ status_id: "s2" })
    })

    it("rejects a blank status", () => {
        expect(moveTaskServerZodSchema.safeParse({ status_id: "" }).success).toBe(false)
    })
})
