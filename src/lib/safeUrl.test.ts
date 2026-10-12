import { describe, expect, it } from "vitest"
import { toSafeExternalUrl } from "./safeUrl"

describe("toSafeExternalUrl", () => {
  it.each(["https://x.test", "http://x.test"])("keeps %s", (raw) => {
    expect(toSafeExternalUrl(raw)).toBe(`${raw}/`)
  })

  it.each(["javascript:alert(1)", "data:text/html,x", "ftp://x", "not a url", ""])("rejects %s", (raw) => {
    expect(toSafeExternalUrl(raw)).toBeNull()
  })
})
