import { describe, expect, it } from "vitest"
import { ApiRequestError } from "./apiFailure"
import { isMissingRecord } from "./missingRecord"

describe("isMissingRecord", () => {
  it("reads a 404 or a 400 from the API as a record that is not there", () => {
    expect(isMissingRecord(new ApiRequestError("GET /clients/:id", { status: 404 }))).toBe(true)
    expect(isMissingRecord(new ApiRequestError("GET /clients/:id", { status: 400 }))).toBe(true)
  })

  it("keeps an outage or a refusal an error", () => {
    expect(isMissingRecord(new ApiRequestError("GET /clients/:id", { status: 500 }))).toBe(false)
    expect(isMissingRecord(new ApiRequestError("GET /clients/:id", { status: 403 }))).toBe(false)
    expect(isMissingRecord(new ApiRequestError("GET /clients/:id", {}))).toBe(false)
    expect(isMissingRecord(new Error("boom"))).toBe(false)
  })
})
