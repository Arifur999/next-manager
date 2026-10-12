import { describe, expect, it } from "vitest"
import { FEED_PAGE_SIZE, nextPageOf } from "./paging"

const page = (rows: number, meta?: { page: number; limit: number; total: number; totalPages?: number; totalPage?: number }) => ({
  success: true,
  message: "ok",
  data: Array.from({ length: rows }, (_, index) => index),
  meta,
})

describe("nextPageOf", () => {
  it("follows totalPages from the meta", () => {
    expect(nextPageOf(page(50, { page: 1, limit: 50, total: 120, totalPages: 3 }), 1)).toBe(2)
    expect(nextPageOf(page(20, { page: 3, limit: 50, total: 120, totalPages: 3 }), 3)).toBeUndefined()
  })

  it("still reads the deprecated totalPage", () => {
    expect(nextPageOf(page(50, { page: 1, limit: 50, total: 60, totalPage: 2 }), 1)).toBe(2)
  })

  it("without meta, stops on a short page", () => {
    expect(nextPageOf(page(FEED_PAGE_SIZE), 1)).toBe(2)
    expect(nextPageOf(page(12), 2)).toBeUndefined()
  })
})
