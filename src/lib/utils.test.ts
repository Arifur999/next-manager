import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("keeps a custom text size next to a text colour", () => {
    expect(cn("text-heading", "text-foreground")).toBe("text-heading text-foreground")
  })

  it("still lets a later size win over an earlier one", () => {
    expect(cn("text-display", "text-heading")).toBe("text-heading")
    expect(cn("text-sm", "text-display-lg")).toBe("text-display-lg")
  })
})
