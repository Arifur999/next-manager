import { describe, expect, it } from "vitest"
import { isSquareEnforced, lockedSquareReason, roleTitle, type IPermissionCatalogue } from "./permission.types"

describe("roleTitle", () => {
    it("uses the label a known role has been given", () => {
        expect(roleTitle("project_manager")).toBe("Project Manager")
    })

    it("still reads a role it has not been taught as words", () => {
        expect(roleTitle("super_admin")).toBe("Super Admin")
    })
})

describe("isSquareEnforced", () => {
    const catalogue: IPermissionCatalogue = {
        modules: [{ module: "vault", actions: ["view", "delete"] }],
        actions: ["view", "delete"],
        scopes: ["all", "none"],
        squares: [
            { module: "vault", action: "view", enforced: true },
            { module: "vault", action: "delete", enforced: false },
        ],
    }

    it("reads the flag the API sends", () => {
        expect(isSquareEnforced(catalogue, "vault", "view")).toBe(true)
        expect(isSquareEnforced(catalogue, "vault", "delete")).toBe(false)
    })

    it("treats a square the API did not mention as enforced", () => {
        expect(isSquareEnforced({ ...catalogue, squares: undefined }, "vault", "delete")).toBe(true)
        expect(isSquareEnforced(catalogue, "leads", "edit")).toBe(true)
    })
})

describe("lockedSquareReason", () => {
    it("names the admin for deletes and for the team", () => {
        expect(lockedSquareReason("vault", "delete")).toMatch(/Only an admin can delete/)
        expect(lockedSquareReason("team", "edit")).toMatch(/adds, changes or removes colleagues/)
    })
})
