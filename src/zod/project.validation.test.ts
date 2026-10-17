import { describe, expect, it } from "vitest"
import { createProjectServerZodSchema, updateProjectServerZodSchema } from "./project.validation"

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
