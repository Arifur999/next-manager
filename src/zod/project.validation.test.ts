import { describe, expect, it } from "vitest"
import {
    assignProjectMemberServerZodSchema,
    createMilestoneServerZodSchema,
    createProjectLinkServerZodSchema,
    createProjectServerZodSchema,
    setBaselineServerZodSchema,
    updateMilestoneServerZodSchema,
    updateProjectLinkServerZodSchema,
    updateProjectServerZodSchema,
} from "./project.validation"

const validProject = {
    client_id: "c1",
    name: "Marketing site",
    code: "ACME-WEB",
    status_id: "s1",
    start_date: "2026-10-01",
    end_date: "",
    contract_value_usd: "4800",
    description: "",
    notes: "",
}

describe("createProjectServerZodSchema", () => {
    it("builds the API payload with the code and a numeric contract value", () => {
        expect(createProjectServerZodSchema.parse(validProject)).toEqual({
            client_id: "c1",
            name: "Marketing site",
            code: "ACME-WEB",
            status_id: "s1",
            start_date: "2026-10-01",
            end_date: null,
            contract_value_usd: 4800,
            description: "",
            notes: "",
        })
    })

    it("sends a blank contract value as zero and blank dates as null", () => {
        const payload = createProjectServerZodSchema.parse({ ...validProject, contract_value_usd: "", start_date: "" })
        expect(payload.contract_value_usd).toBe(0)
        expect(payload.start_date).toBeNull()
    })

    it("rejects a negative contract value", () => {
        expect(
            createProjectServerZodSchema.safeParse({ ...validProject, contract_value_usd: "-10" }).error?.issues[0]?.message,
        ).toBe("Contract value must be a number that is not negative")
    })

    it("requires a client, a code and a status", () => {
        const result = createProjectServerZodSchema.safeParse({ ...validProject, client_id: "", code: "", status_id: "" })
        expect(result.error?.issues.map((issue) => issue.message)).toEqual([
            "Choose a client",
            "Code is required",
            "Choose a status",
        ])
    })
})

describe("updateProjectServerZodSchema", () => {
    it("leaves the code out of the payload", () => {
        expect(updateProjectServerZodSchema.parse(validProject)).not.toHaveProperty("code")
    })
})

describe("assignProjectMemberServerZodSchema", () => {
    const validAssignment = { project_id: "p1", user_id: "u1", role_on_project: "Designer" }

    it("builds the API payload", () => {
        expect(assignProjectMemberServerZodSchema.parse(validAssignment)).toEqual(validAssignment)
    })

    it("requires somebody to assign and the project to assign them to", () => {
        expect(assignProjectMemberServerZodSchema.safeParse({ ...validAssignment, user_id: "" }).error?.issues[0]?.message).toBe(
            "Choose someone",
        )
        expect(assignProjectMemberServerZodSchema.safeParse({ ...validAssignment, project_id: "" }).success).toBe(false)
    })
})

describe("createProjectLinkServerZodSchema", () => {
    const validLink = { project_id: "p1", label: "Figma file", url: "https://figma.com/file/x" }

    it("trims the label and URL into the API payload", () => {
        expect(
            createProjectLinkServerZodSchema.parse({ ...validLink, label: " Figma file ", url: "https://figma.com/file/x  " }),
        ).toEqual(validLink)
    })

    it("rejects a label or URL that is only spaces", () => {
        expect(createProjectLinkServerZodSchema.safeParse({ ...validLink, label: "  " }).error?.issues[0]?.message).toBe(
            "Give it a name",
        )
        expect(createProjectLinkServerZodSchema.safeParse({ ...validLink, url: "" }).success).toBe(false)
    })

    it("requires the project it belongs to", () => {
        expect(createProjectLinkServerZodSchema.safeParse({ ...validLink, project_id: "" }).success).toBe(false)
    })
})

describe("updateMilestoneServerZodSchema", () => {
    it("sends the new title and day, and never a project", () => {
        expect(
            updateMilestoneServerZodSchema.parse({ title: " Final handover ", due_date: "2026-11-09", project_id: "p2" }),
        ).toEqual({ title: "Final handover", due_date: "2026-11-09" })
    })

    it("still needs a due day", () => {
        expect(updateMilestoneServerZodSchema.safeParse({ title: "Handover", due_date: "" }).success).toBe(false)
    })
})

describe("updateProjectLinkServerZodSchema", () => {
    it("trims a renamed link and refuses a blank one", () => {
        expect(updateProjectLinkServerZodSchema.parse({ label: " Staging ", url: " https://staging.test " })).toEqual({
            label: "Staging",
            url: "https://staging.test",
        })
        expect(updateProjectLinkServerZodSchema.safeParse({ label: "", url: "https://staging.test" }).success).toBe(false)
    })
})

describe("createMilestoneServerZodSchema", () => {
    const validMilestone = { project_id: "p1", title: "Design handover", due_date: "2026-11-02" }

    it("trims the title into the API payload", () => {
        expect(createMilestoneServerZodSchema.parse({ ...validMilestone, title: " Design handover " })).toEqual(
            validMilestone,
        )
    })

    it("rejects a blank title and a missing due date", () => {
        expect(createMilestoneServerZodSchema.safeParse({ ...validMilestone, title: " " }).error?.issues[0]?.message).toBe(
            "Title is required",
        )
        expect(createMilestoneServerZodSchema.safeParse({ ...validMilestone, due_date: "" }).error?.issues[0]?.message).toBe(
            "Pick a date",
        )
    })

    it("requires the project it belongs to", () => {
        expect(createMilestoneServerZodSchema.safeParse({ ...validMilestone, project_id: "" }).success).toBe(false)
    })
})

describe("setBaselineServerZodSchema", () => {
    const validBaseline = { baseline_hours: "120", baseline_value_usd: "9600", replace_existing: false }

    it("turns the hours and value into numbers", () => {
        expect(setBaselineServerZodSchema.parse(validBaseline)).toEqual({
            baseline_hours: 120,
            baseline_value_usd: 9600,
            replace_existing: false,
        })
    })

    it("leaves a blank value out so the server takes the contract value", () => {
        expect(setBaselineServerZodSchema.parse({ ...validBaseline, baseline_value_usd: "" }).baseline_value_usd).toBeUndefined()
    })

    it("rejects zero hours and a negative value", () => {
        expect(setBaselineServerZodSchema.safeParse({ ...validBaseline, baseline_hours: "0" }).error?.issues[0]?.message).toBe(
            "Baseline hours must be greater than zero",
        )
        expect(setBaselineServerZodSchema.safeParse({ ...validBaseline, baseline_value_usd: "-1" }).success).toBe(false)
    })

    it("passes on a request to replace the existing baseline", () => {
        expect(setBaselineServerZodSchema.parse({ ...validBaseline, replace_existing: true }).replace_existing).toBe(true)
    })
})
