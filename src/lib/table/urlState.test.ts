import type { DataTableFilterConfig } from "@/components/shared/table/dataTable.types"
import { describe, expect, it } from "vitest"
import { buildTableQueryString, filterParamKeys, readFilterValues, readPaging, writeFilterValue } from "./urlState"

const CONFIG = { queryKeys: ["search", "kind", "from", "to"], defaultLimit: 20 }

const FILTERS: DataTableFilterConfig[] = [
  { id: "kind", type: "single-select", label: "Kind", options: [] },
  { id: "type", type: "multi-select", label: "Type", options: [] },
  { id: "date", type: "date-range", label: "Date" },
]

describe("buildTableQueryString", () => {
  it("builds the same string from the page's searchParams and the browser's URL", () => {
    const fromPage = buildTableQueryString({ kind: "income", page: "2", utm_source: "mail" }, CONFIG)
    const fromBrowser = buildTableQueryString(new URLSearchParams("utm_source=mail&kind=income&page=2"), CONFIG)
    expect(fromPage).toBe("page=2&limit=20&kind=income")
    expect(fromBrowser).toBe(fromPage)
  })

  it("keeps only the endpoint's keys and drops empty ones", () => {
    expect(buildTableQueryString({ search: "", kind: "expense", admin: "true" }, CONFIG)).toBe("page=1&limit=20&kind=expense")
  })

  it("keeps repeated keys", () => {
    expect(buildTableQueryString({ kind: ["income", "expense"] }, CONFIG)).toBe("page=1&limit=20&kind=income&kind=expense")
  })
})

describe("readPaging", () => {
  it("falls back to page 1 and the default size for junk", () => {
    expect(readPaging({ page: "-3", limit: "abc" }, 10)).toEqual({ page: 1, limit: 10 })
  })

  it("caps the page size", () => {
    expect(readPaging({ limit: "5000" }, 10).limit).toBe(100)
  })
})

describe("readFilterValues", () => {
  it("reads single, multi and range filters from the URL", () => {
    const params = new URLSearchParams("kind=income&type=salary&type=bonus&from=2026-01-01")
    expect(readFilterValues(params, FILTERS)).toEqual({
      kind: "income",
      type: ["salary", "bonus"],
      date: { from: "2026-01-01", to: undefined },
    })
  })

  it("leaves a range with neither end undefined", () => {
    expect(readFilterValues(new URLSearchParams(""), FILTERS).date).toBeUndefined()
  })
})

describe("writeFilterValue", () => {
  it("replaces a filter's parameters and drops them when cleared", () => {
    const params = new URLSearchParams("type=salary&from=2026-01-01&to=2026-01-31&page=3")
    writeFilterValue(params, FILTERS[1], ["bonus", "commission"])
    writeFilterValue(params, FILTERS[2], undefined)
    expect(params.toString()).toBe("page=3&type=bonus&type=commission")
  })

  it("writes a date range to from and to", () => {
    const params = new URLSearchParams()
    writeFilterValue(params, FILTERS[2], { from: "2026-02-01", to: "2026-02-28" })
    expect(params.toString()).toBe("from=2026-02-01&to=2026-02-28")
  })

  it("knows which parameters each filter owns", () => {
    expect(filterParamKeys(FILTERS[0])).toEqual(["kind"])
    expect(filterParamKeys(FILTERS[2])).toEqual(["from", "to"])
  })
})
