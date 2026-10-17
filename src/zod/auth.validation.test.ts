import { describe, expect, it } from "vitest"
import {
  agencyJoinServerZodSchema,
  changePasswordServerZodSchema,
  forgotPasswordServerZodSchema,
  joinServerZodSchema,
  newPassword,
  registerServerZodSchema,
  requiredEmail,
  resetPasswordServerZodSchema,
  updateProfileServerZodSchema,
} from "./auth.validation"

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

describe("updateProfileServerZodSchema", () => {
  it("trims the name and phone", () => {
    expect(updateProfileServerZodSchema.parse({ full_name: " Rina Das ", phone: " 01711 " })).toEqual({
      full_name: "Rina Das",
      phone: "01711",
    })
  })

  it("allows clearing the phone but not the name", () => {
    expect(updateProfileServerZodSchema.parse({ full_name: "Rina", phone: "" }).phone).toBe("")
    expect(updateProfileServerZodSchema.safeParse({ full_name: "  ", phone: "" }).success).toBe(false)
  })

  it("drops anything outside the allow-list, such as a role", () => {
    expect(updateProfileServerZodSchema.parse({ full_name: "Rina", phone: "", role: "admin" })).toEqual({
      full_name: "Rina",
      phone: "",
    })
  })
})

describe("changePasswordServerZodSchema", () => {
  it("sends the old and the new password", () => {
    expect(changePasswordServerZodSchema.parse({ old_password: "old", new_password: "newpass12" })).toEqual({
      old_password: "old",
      new_password: "newpass12",
    })
  })

  it("refuses a missing current password and a weak new one", () => {
    const missing = changePasswordServerZodSchema.safeParse({ old_password: "", new_password: "newpass12" })
    expect(missing.error?.issues[0]?.message).toBe("Current password is required")
    expect(changePasswordServerZodSchema.safeParse({ old_password: "old", new_password: "short" }).success).toBe(false)
  })
})

describe("requiredEmail", () => {
  it("says an empty email is missing before calling it invalid", () => {
    expect(requiredEmail.safeParse("").error?.issues.map((issue) => issue.message)).toEqual(["Email is required"])
    expect(requiredEmail.safeParse("rina").error?.issues[0]?.message).toBe("Enter a valid email address")
    expect(requiredEmail.safeParse("rina@northwind.com").success).toBe(true)
  })
})

describe("registerServerZodSchema", () => {
  const valid = {
    organization_name: "Northwind Studio",
    full_name: "Rina Das",
    email: "rina@northwind.com",
    phone: " 01711 ",
    password: "welcome12",
  }

  it("builds the sign-up payload with a trimmed phone", () => {
    expect(registerServerZodSchema.parse(valid)).toEqual({ ...valid, phone: "01711" })
  })

  it("leaves out an empty phone", () => {
    expect(registerServerZodSchema.parse({ ...valid, phone: "  " }).phone).toBeUndefined()
  })

  it("has no role to send, whatever arrives", () => {
    expect(registerServerZodSchema.parse({ ...valid, role: "super_admin" })).not.toHaveProperty("role")
  })

  it("refuses a missing company name and a weak password", () => {
    expect(registerServerZodSchema.safeParse({ ...valid, organization_name: "" }).success).toBe(false)
    expect(registerServerZodSchema.safeParse({ ...valid, password: "welcome" }).success).toBe(false)
  })
})

describe("forgotPasswordServerZodSchema", () => {
  it("sends only the email", () => {
    expect(forgotPasswordServerZodSchema.parse({ email: "rina@northwind.com", extra: 1 })).toEqual({
      email: "rina@northwind.com",
    })
  })

  it("refuses something that is not an email", () => {
    expect(forgotPasswordServerZodSchema.safeParse({ email: "rina" }).success).toBe(false)
  })
})

describe("resetPasswordServerZodSchema", () => {
  it("sends the token and the new password", () => {
    expect(resetPasswordServerZodSchema.parse({ token: "t1", new_password: "newpass12" })).toEqual({
      token: "t1",
      new_password: "newpass12",
    })
  })

  it("refuses a link with no token and a weak password", () => {
    const noToken = resetPasswordServerZodSchema.safeParse({ token: "", new_password: "newpass12" })
    expect(noToken.error?.issues[0]?.message).toBe("This reset link is incomplete")
    expect(resetPasswordServerZodSchema.safeParse({ token: "t1", new_password: "short" }).success).toBe(false)
  })
})

describe("joinServerZodSchema", () => {
  it("sends a name and a password, never an email", () => {
    expect(joinServerZodSchema.parse({ full_name: "Alex", password: "welcome12", email: "x@evil.example" })).toEqual({
      full_name: "Alex",
      password: "welcome12",
    })
  })

  it("refuses a missing name and a weak password", () => {
    expect(joinServerZodSchema.safeParse({ full_name: "", password: "welcome12" }).success).toBe(false)
    expect(joinServerZodSchema.safeParse({ full_name: "Alex", password: "12345678" }).success).toBe(false)
  })
})

describe("agencyJoinServerZodSchema", () => {
  const valid = { full_name: "Alex", company_name: "Northwind Studio", password: "welcome12" }

  it("sends the owner's name, the agency's name and the password", () => {
    expect(agencyJoinServerZodSchema.parse({ ...valid, role: "super_admin" })).toEqual(valid)
  })

  it("refuses an agency without a name or with one too long", () => {
    expect(agencyJoinServerZodSchema.safeParse({ ...valid, company_name: "" }).success).toBe(false)
    expect(agencyJoinServerZodSchema.safeParse({ ...valid, company_name: "x".repeat(121) }).success).toBe(false)
  })
})
