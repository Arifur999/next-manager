import { describe, expect, it } from "vitest"
import { createDomainKeys, queryKeys } from "./queryKeys"

describe("createDomainKeys", () => {
  const keys = createDomainKeys("clients")

  it("prefixes every key with the root", () => {
    expect(keys.all).toEqual(["clients"])
    expect(keys.list("status=active")).toEqual(["clients", "list", "status=active"])
    expect(keys.count()).toEqual(["clients", "count", ""])
    expect(keys.detail("c1")).toEqual(["clients", "detail", "c1"])
  })
})

describe("queryKeys", () => {
  const domains = Object.values(queryKeys)

  it("starts every key with its registered root", () => {
    for (const domain of domains) {
      const [root] = domain.all
      expect(domain.list("x")[0]).toBe(root)
      expect(domain.count("x")[0]).toBe(root)
      expect(domain.detail("x")[0]).toBe(root)
    }
  })

  it("uses each root once", () => {
    const roots = domains.map((domain) => domain.all[0])
    expect(new Set(roots).size).toBe(roots.length)
  })
})
