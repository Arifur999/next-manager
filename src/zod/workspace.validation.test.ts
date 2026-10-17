import { describe, expect, it } from "vitest"
import { createCredentialServerZodSchema, credentialFormZodSchema } from "./workspace.validation"

describe("credentialFormZodSchema", () => {
    const valid = { label: "Acme cPanel", password: "s3cret" }

    it("accepts a credential with no URL", () => {
        expect(credentialFormZodSchema.safeParse(valid).success).toBe(true)
        expect(credentialFormZodSchema.safeParse({ ...valid, url: "" }).success).toBe(true)
    })

    it("accepts only http and https links", () => {
        expect(credentialFormZodSchema.safeParse({ ...valid, url: "https://acme.example" }).success).toBe(true)
        const script = credentialFormZodSchema.safeParse({ ...valid, url: "javascript:alert(1)" })
        expect(script.error?.issues[0]?.message).toBe("Enter a full URL, including https://")
    })

    it("requires a label and a password", () => {
        expect(credentialFormZodSchema.safeParse({ ...valid, label: "" }).success).toBe(false)
        expect(credentialFormZodSchema.safeParse({ ...valid, password: "" }).success).toBe(false)
    })
})

describe("createCredentialServerZodSchema", () => {
    const valid = {
        label: "Acme cPanel",
        client_id: "c1",
        project_id: "",
        url: "https://acme.example",
        username: "admin",
        password: "s3cret",
        notes: "",
    }

    it("builds the API payload, with no project as null", () => {
        expect(createCredentialServerZodSchema.parse(valid)).toEqual({
            label: "Acme cPanel",
            client_id: "c1",
            project_id: null,
            url: "https://acme.example",
            username: "admin",
            password: "s3cret",
            notes: "",
        })
    })

    it("sends an agency-internal credential with neither client nor project", () => {
        const payload = createCredentialServerZodSchema.parse({ ...valid, client_id: "" })
        expect(payload.client_id).toBeNull()
        expect(payload.project_id).toBeNull()
    })

    it("refuses a link that is not http or https", () => {
        expect(createCredentialServerZodSchema.safeParse({ ...valid, url: "data:text/html,hi" }).success).toBe(false)
    })
})
