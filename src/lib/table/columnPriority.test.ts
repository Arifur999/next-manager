import { describe, expect, it } from "vitest"
import { columnPriorityClass } from "./columnPriority"

describe("columnPriorityClass", () => {
  it("hides a low-priority column below md and shows it from md", () => {
    expect(columnPriorityClass("low")).toBe("hidden md:table-cell")
  })

  it("leaves every other column alone", () => {
    expect(columnPriorityClass(undefined)).toBeUndefined()
  })
})
