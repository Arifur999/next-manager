import { describe, expect, it } from "vitest"
import { plural, sentenceCase } from "./text"

describe("plural", () => {
  it("uses the singular for exactly one", () => {
    expect(plural(1, "deal")).toBe("1 deal")
  })

  it("adds an s for zero and for more than one", () => {
    expect(plural(0, "deal")).toBe("0 deals")
    expect(plural(2, "deal")).toBe("2 deals")
  })

  it("takes an irregular plural", () => {
    expect(plural(3, "person", "people")).toBe("3 people")
    expect(plural(1, "person", "people")).toBe("1 person")
  })

  it("groups thousands", () => {
    expect(plural(1200, "task")).toBe("1,200 tasks")
  })
})

describe("sentenceCase", () => {
  it("capitalises only the first word", () => {
    expect(sentenceCase("On Hold")).toBe("On hold")
    expect(sentenceCase("in review")).toBe("In review")
  })

  it("reads snake case and shouting as words", () => {
    expect(sentenceCase("IN_REVIEW")).toBe("In review")
    expect(sentenceCase("on_hold")).toBe("On hold")
  })

  it("keeps acronyms an agency typed", () => {
    expect(sentenceCase("In QA")).toBe("In QA")
    expect(sentenceCase("iOS release")).toBe("iOS release")
    expect(sentenceCase("QA")).toBe("QA")
  })

  it("leaves a single word alone", () => {
    expect(sentenceCase("Done")).toBe("Done")
  })
})
