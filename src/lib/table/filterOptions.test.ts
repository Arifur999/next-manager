import { describe, expect, it } from "vitest"
import { optionsFromValues } from "./filterOptions"

describe("optionsFromValues", () => {
  it("lists each value once, alphabetically", () => {
    expect(optionsFromValues(["Software", "Office rent", "Software"])).toEqual([
      { label: "Office rent", value: "Office rent" },
      { label: "Software", value: "Software" },
    ])
  })

  it("drops blanks", () => {
    expect(optionsFromValues(["", null, undefined, "Cash"])).toEqual([{ label: "Cash", value: "Cash" }])
  })
})
