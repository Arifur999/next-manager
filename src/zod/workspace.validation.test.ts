import { describe, expect, it } from "vitest"
import {
    createConversationServerZodSchema,
    createCredentialServerZodSchema,
    credentialFormZodSchema,
    notificationRuleServerZodSchema,
    sendMessageServerZodSchema,
} from "./workspace.validation"

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

describe("createConversationServerZodSchema", () => {
    it("sends a direct thread without a name", () => {
        expect(createConversationServerZodSchema.parse({ type: "direct", name: "ignored", member_ids: ["u1"] })).toEqual({
            type: "direct",
            name: undefined,
            member_ids: ["u1"],
        })
    })

    it("trims a group's name", () => {
        const payload = createConversationServerZodSchema.parse({ type: "group", name: " Studio ", member_ids: ["u1", "u2"] })
        expect(payload).toEqual({ type: "group", name: "Studio", member_ids: ["u1", "u2"] })
    })

    it("refuses a direct thread with more than one other person", () => {
        const result = createConversationServerZodSchema.safeParse({ type: "direct", name: "", member_ids: ["u1", "u2"] })
        expect(result.error?.issues[0]?.message).toBe("A direct conversation is between you and exactly one other person")
    })

    it("refuses a group without a name or without anybody in it", () => {
        const unnamed = createConversationServerZodSchema.safeParse({ type: "group", name: " ", member_ids: ["u1"] })
        expect(unnamed.error?.issues[0]?.message).toBe("Give the group a name")
        expect(createConversationServerZodSchema.safeParse({ type: "group", name: "Studio", member_ids: [] }).success).toBe(
            false,
        )
    })
})

describe("sendMessageServerZodSchema", () => {
    it("trims the message", () => {
        expect(sendMessageServerZodSchema.parse({ body: "  On my way  " })).toEqual({ body: "On my way" })
    })

    it("refuses an empty or overlong message", () => {
        expect(sendMessageServerZodSchema.safeParse({ body: "   " }).success).toBe(false)
        expect(sendMessageServerZodSchema.safeParse({ body: "x".repeat(4001) }).success).toBe(false)
    })
})

describe("notificationRuleServerZodSchema", () => {
    it("passes one switch through and leaves the rest out", () => {
        expect(notificationRuleServerZodSchema.parse({ email: true })).toEqual({ email: true })
        expect(notificationRuleServerZodSchema.parse({ roles: [] })).toEqual({ roles: [] })
    })

    it("refuses a role a company notification cannot go to", () => {
        expect(notificationRuleServerZodSchema.safeParse({ roles: ["super_admin"] }).success).toBe(false)
    })

    it("refuses a switch that is not true or false", () => {
        expect(notificationRuleServerZodSchema.safeParse({ in_app: "yes" }).success).toBe(false)
    })
})
