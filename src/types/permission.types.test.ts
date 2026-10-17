import { describe, expect, it } from "vitest"
import { roleTitle } from "./permission.types"

describe("roleTitle", () => {
    it("uses the label a known role has been given", () => {
        expect(roleTitle("project_manager")).toBe("Project Manager")
    })

    it("still reads a role it has not been taught as words", () => {
        expect(roleTitle("super_admin")).toBe("Super Admin")
    })
})
