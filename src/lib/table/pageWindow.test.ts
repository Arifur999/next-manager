import { describe, expect, it } from "vitest"
import { getPageWindow } from "./pageWindow"

describe("getPageWindow", () => {
  it("lists every page when they fit in seven slots", () => {
    expect(getPageWindow(1, 1)).toEqual([1])
    expect(getPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("collapses the tail near the start", () => {
    expect(getPageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20])
  })

  it("collapses the head near the end", () => {
    expect(getPageWindow(17, 20)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20])
  })

  it("centres the current page", () => {
    expect(getPageWindow(10, 20)).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20])
  })

  it("always uses exactly seven slots once there are more pages", () => {
    for (let page = 1; page <= 30; page++) {
      expect(getPageWindow(page, 30)).toHaveLength(7)
    }
  })
})
