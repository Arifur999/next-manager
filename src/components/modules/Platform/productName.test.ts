import { site } from "@/data/site"
import { describe, expect, it } from "vitest"
import { initialProductName, subjectPreview } from "./productName"

describe("initialProductName", () => {
  it("offers the site's name while the server default is still saved", () => {
    expect(initialProductName("AGENCIO")).toBe(site.name)
    expect(initialProductName("")).toBe(site.name)
  })

  it("keeps a name somebody chose", () => {
    expect(initialProductName("Naxified")).toBe("Naxified")
  })
})

describe("subjectPreview", () => {
  it("shows the name inside a subject the server really sends", () => {
    expect(subjectPreview(" Naxified ")).toBe("Reset your Naxified password")
    expect(subjectPreview("")).toBe(`Reset your ${site.name} password`)
  })
})
