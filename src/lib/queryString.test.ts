import { describe, expect, it } from "vitest"
import { buildQueryString, pickAllowed, toParams } from "./queryString"

describe("buildQueryString", () => {
  it("encodes values so they cannot add parameters", () => {
    expect(buildQueryString({ status: "active&limit=100000" })).toBe("status=active%26limit%3D100000")
  })

  it("drops empty values", () => {
    expect(buildQueryString({ search: "", status: undefined, kind: null, page: 2 })).toBe("page=2")
  })

  it("keeps key order stable", () => {
    expect(buildQueryString({ search: "a b", status: "active" })).toBe("search=a+b&status=active")
    expect(buildQueryString({ status: "active" })).toBe("status=active")
  })
})

describe("toParams", () => {
  it("round-trips an encoded string", () => {
    expect(toParams("status=active%26limit%3D5")).toEqual({ status: "active&limit=5" })
  })

  it("returns undefined for nothing", () => {
    expect(toParams("")).toBeUndefined()
  })
})

describe("pickAllowed", () => {
  const STATUSES = ["active", "archived"] as const

  it("keeps a known value", () => {
    expect(pickAllowed("archived", STATUSES)).toBe("archived")
  })

  it("drops unknown values and arrays", () => {
    expect(pickAllowed("active&limit=5", STATUSES)).toBeUndefined()
    expect(pickAllowed(["active"], STATUSES)).toBeUndefined()
  })
})
