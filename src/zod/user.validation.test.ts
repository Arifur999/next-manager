import { describe, expect, it } from "vitest"
import { NO_DEPARTMENT, createUserServerZodSchema, updateUserServerZodSchema } from "./user.validation"

const newMember = {
  full_name: "Rahim Uddin",
  email: "rahim@example.com",
  phone: "",
  password: "secret123",
  role: "operations",
  department_id: NO_DEPARTMENT,
}

describe("createUserServerZodSchema", () => {
  it("sends no department as null", () => {
    expect(createUserServerZodSchema.parse(newMember)).toEqual({ ...newMember, department_id: null })
  })

  it("keeps a chosen department", () => {
    expect(createUserServerZodSchema.parse({ ...newMember, department_id: "d1" }).department_id).toBe("d1")
  })

  it("refuses a role that cannot be granted from inside a company", () => {
    const result = createUserServerZodSchema.safeParse({ ...newMember, role: "super_admin" })
    expect(result.error?.issues[0]?.message).toBe("Choose a role")
  })

  it("refuses a password without a number", () => {
    const result = createUserServerZodSchema.safeParse({ ...newMember, password: "secretpass" })
    expect(result.error?.issues[0]?.message).toBe("Password must contain a number")
  })

  it("refuses an address that is not an email", () => {
    const result = createUserServerZodSchema.safeParse({ ...newMember, email: "rahim@" })
    expect(result.error?.issues[0]?.message).toBe("Enter a valid email address")
  })
})

describe("updateUserServerZodSchema", () => {
  const edit = { full_name: "Rahim Uddin", phone: "", role: "sales", department_id: "", status: "active" }

  it("sends a blank department as null", () => {
    expect(updateUserServerZodSchema.parse(edit).department_id).toBeNull()
  })

  it("refuses to put somebody back into pending", () => {
    expect(updateUserServerZodSchema.safeParse({ ...edit, status: "pending" }).success).toBe(false)
  })
})
