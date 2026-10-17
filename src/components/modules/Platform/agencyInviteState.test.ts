import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { agencyInviteState } from "./agencyInviteState"

const invite = (overrides: Partial<{ used_at: string | null; revoked_at: string | null; expires_at: string }>) => ({
  used_at: null,
  revoked_at: null,
  expires_at: "2026-10-20T00:00:00.000Z",
  ...overrides,
})

describe("agencyInviteState", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("waits until it is opened, revoked or out of date", () => {
    expect(agencyInviteState(invite({}))).toBe("waiting")
    expect(agencyInviteState(invite({ expires_at: "2026-10-16T00:00:00.000Z" }))).toBe("expired")
    expect(agencyInviteState(invite({ revoked_at: "2026-10-15T00:00:00.000Z" }))).toBe("revoked")
  })

  it("stays opened even after its expiry passes", () => {
    expect(
      agencyInviteState(invite({ used_at: "2026-10-01T00:00:00.000Z", expires_at: "2026-10-02T00:00:00.000Z" })),
    ).toBe("opened")
  })
})
