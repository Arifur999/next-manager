import { describe, expect, it } from "vitest"
import {
    createTaskServerZodSchema,
    createWorkflowStatusServerZodSchema,
    logTimeServerZodSchema,
    moveTaskServerZodSchema,
    updateOwnTaskServerZodSchema,
    updateTaskServerZodSchema,
    updateWorkflowStatusServerZodSchema,
} from "./work.validation"

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

    it("sends a description when one was written, trimmed", () => {
        const payload = createTaskServerZodSchema.parse({ ...validTask, description: "  Copy is final\t" })
        expect(payload.description).toBe("Copy is final")
        expect(createTaskServerZodSchema.parse({ ...validTask, description: "   " }).description).toBeUndefined()
    })

    it("requires a project and a title", () => {
        const result = createTaskServerZodSchema.safeParse({ ...validTask, project_id: "", title: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual(["Choose a project", "Title is required"])
    })

    it("rejects a priority the API does not know", () => {
        expect(createTaskServerZodSchema.safeParse({ ...validTask, priority: "critical" }).success).toBe(false)
    })
})

describe("updateTaskServerZodSchema", () => {
    const edit = {
        title: "Ship the pricing page",
        status_id: "s2",
        assignee_id: "u1",
        priority: "urgent",
        due_date: "2026-11-02",
        description: "Copy is final",
    }

    it("builds the API payload from the sheet's values", () => {
        expect(updateTaskServerZodSchema.parse(edit)).toEqual(edit)
    })

    it("clears the assignee and due date with null so the API changes them", () => {
        const payload = updateTaskServerZodSchema.parse({ ...edit, assignee_id: "", due_date: "" })
        expect(payload.assignee_id).toBeNull()
        expect(payload.due_date).toBeNull()
    })

    it("refuses a blank title, a missing column and a day that does not exist", () => {
        const result = updateTaskServerZodSchema.safeParse({ ...edit, title: "", status_id: "", due_date: "2026-02-31" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual([
            "Title is required",
            "Choose a column",
            "Pick a date",
        ])
    })
})

describe("updateOwnTaskServerZodSchema", () => {
    it("sends only the status and description, the two keys operations may change", () => {
        const payload = updateOwnTaskServerZodSchema.parse({
            title: "Renamed",
            status_id: "s3",
            assignee_id: "u2",
            priority: "low",
            due_date: "2026-12-01",
            description: "Blocked on copy",
        })
        expect(payload).toEqual({ status_id: "s3", description: "Blocked on copy" })
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

describe("createWorkflowStatusServerZodSchema", () => {
    const validStatus = { kind: "task", name: "In QA", category: "active" }

    it("trims the name into the API payload", () => {
        expect(createWorkflowStatusServerZodSchema.parse({ ...validStatus, name: "  In QA " })).toEqual(validStatus)
    })

    it("rejects a blank name and one longer than a column heading", () => {
        expect(createWorkflowStatusServerZodSchema.safeParse({ ...validStatus, name: " " }).error?.issues[0]?.message).toBe(
            "Give it a name",
        )
        expect(
            createWorkflowStatusServerZodSchema.safeParse({ ...validStatus, name: "x".repeat(41) }).error?.issues[0]?.message,
        ).toBe("That is longer than a column heading")
    })

    it("rejects a meaning or a board the API does not know", () => {
        expect(createWorkflowStatusServerZodSchema.safeParse({ ...validStatus, category: "paused" }).error?.issues[0]?.message).toBe(
            "Say what this status means",
        )
        expect(createWorkflowStatusServerZodSchema.safeParse({ ...validStatus, kind: "lead" }).success).toBe(false)
    })
})

describe("updateWorkflowStatusServerZodSchema", () => {
    it("passes one change through and drops the keys the board does not change", () => {
        expect(updateWorkflowStatusServerZodSchema.parse({ is_active: false, kind: "project" })).toEqual({ is_active: false })
    })

    it("rejects a negative or fractional position", () => {
        expect(updateWorkflowStatusServerZodSchema.safeParse({ sort_order: -1 }).success).toBe(false)
        expect(updateWorkflowStatusServerZodSchema.safeParse({ sort_order: 1.5 }).success).toBe(false)
    })
})

describe("logTimeServerZodSchema", () => {
    const validEntry = {
        project_id: "p1",
        task_id: "t1",
        date: "2026-10-16",
        hours: "6.5",
        is_billable: true,
        notes: "Pricing page",
    }

    it("builds the API payload with the hours as a number", () => {
        expect(logTimeServerZodSchema.parse(validEntry)).toEqual({ ...validEntry, hours: 6.5 })
    })

    it("sends a blank task as null", () => {
        expect(logTimeServerZodSchema.parse({ ...validEntry, task_id: "" }).task_id).toBeNull()
    })

    it("rejects zero hours and more than a day", () => {
        expect(logTimeServerZodSchema.safeParse({ ...validEntry, hours: "0" }).error?.issues[0]?.message).toBe(
            "Hours must be greater than zero",
        )
        expect(logTimeServerZodSchema.safeParse({ ...validEntry, hours: "65" }).error?.issues[0]?.message).toBe(
            "A day is 24 hours — check the decimal point",
        )
    })

    it("requires a project and a date", () => {
        expect(logTimeServerZodSchema.safeParse({ ...validEntry, project_id: "" }).error?.issues[0]?.message).toBe(
            "Choose a project",
        )
        expect(logTimeServerZodSchema.safeParse({ ...validEntry, date: "16/10/2026" }).success).toBe(false)
    })
})
