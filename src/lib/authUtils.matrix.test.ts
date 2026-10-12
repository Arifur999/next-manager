import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { canRoleReach, type UserRole } from "./authUtils"

// The same snapshot `npm run test:matrix` checks against a running server,
// asserted here against the route table alone, so a change to AREAS fails in
// `npm test` with the route and role named.
const SNAPSHOT = new URL("../../scripts/role-matrix.expected.txt", import.meta.url)

const lines = readFileSync(SNAPSHOT, "utf8").replace(/\r\n/g, "\n").trim().split("\n")
const roles = lines[0].trim().split(/\s+/).slice(1) as UserRole[]
const rows = lines
  .slice(2)
  .map((line) => line.trim().split(/\s+/))
  .map(([route, ...cells]) => ({ route, cells }))

describe("route table matches the role matrix snapshot", () => {
  it("reads four company roles and every route", () => {
    expect(roles).toEqual(["admin", "sales", "project_manager", "operations"])
    expect(rows.length).toBeGreaterThan(50)
  })

  for (const { route, cells } of rows) {
    it(route, () => {
      const actual = roles.map((role) => (canRoleReach(route, role) ? "open" : "----"))
      expect(Object.fromEntries(roles.map((role, index) => [role, actual[index]]))).toEqual(
        Object.fromEntries(roles.map((role, index) => [role, cells[index]])),
      )
    })
  }
})
