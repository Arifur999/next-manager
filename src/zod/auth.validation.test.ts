import { describe, expect, it } from "vitest"
import {
  changePasswordServerZodSchema,
  forgotPasswordServerZodSchema,
  newPassword,
  registerServerZodSchema,
  requiredEmail,
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
