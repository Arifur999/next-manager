import { describe, expect, it } from "vitest"
import {
    permissionCellServerZodSchema,
    rolePermissionServerZodSchema,
    userPermissionServerZodSchema,
} from "./permission.validation"

const square = { role: "project_manager", module: "invoices", action: "view", scope: "own" }

describe("rolePermissionServerZodSchema", () => {
    it("accepts one square of a role's grid", () => {
        expect(rolePermissionServerZodSchema.parse(square)).toEqual(square)
    })

    it("refuses a scope the grid does not offer", () => {
        const result = rolePermissionServerZodSchema.safeParse({ ...square, scope: "everything" })
        expect(result.error?.issues[0]?.message).toBe("Unknown scope")
    })
})

describe("userPermissionServerZodSchema", () => {
    it("drops a role sent with a person's override", () => {
        expect(userPermissionServerZodSchema.parse(square)).toEqual({ module: "invoices", action: "view", scope: "own" })
    })
})

describe("permissionCellServerZodSchema", () => {
    it("accepts a module and an action", () => {
        expect(permissionCellServerZodSchema.parse({ module: "time", action: "delete" })).toEqual({
            module: "time",
            action: "delete",
        })
    })

    it("refuses a module that would change the API path", () => {
        const result = permissionCellServerZodSchema.safeParse({ module: "../users", action: "view" })
        expect(result.error?.issues[0]?.message).toBe("Unknown module")
    })
})
