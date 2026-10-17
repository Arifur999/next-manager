import { describe, expect, it } from "vitest"
import { newPassword } from "./auth.validation"

describe("newPassword", () => {
  it("accepts eight characters with a letter and a number", () => {
    expect(newPassword.safeParse("secret12").success).toBe(true)
  })

  it("names what is missing", () => {
    expect(newPassword.safeParse("s3cret").error?.issues[0]?.message).toBe("Password must be at least 8 characters")
    expect(newPassword.safeParse("12345678").error?.issues[0]?.message).toBe("Password must contain a letter")
    expect(newPassword.safeParse("password").error?.issues[0]?.message).toBe("Password must contain a number")
  })
})
