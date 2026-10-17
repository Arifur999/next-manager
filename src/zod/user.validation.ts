import { z } from "zod"

// Mirrors the backend's assignableRoles: super_admin is a platform role and
// cannot be granted from inside a company. admin CAN be granted - a company
// may want a second one, and the last-admin guard makes that safe.
export const ASSIGNABLE_ROLES = ["admin", "sales", "project_manager", "operations"] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export const isAssignableRole = (role: string): role is AssignableRole =>
  ASSIGNABLE_ROLES.some((assignable) => assignable === role)

export const ROLE_LABELS: Record<AssignableRole, string> = {
  admin: "Admin — finance and company state",
  sales: "Sales — clients, leads, invoices",
  project_manager: "Project manager — projects, teams, schedule",
  operations: "Operations — does the work, logs time",
}

// The Select's value for "no department": it cannot hold "", and null is a real
// answer here, for somebody who works across all of them.
export const NO_DEPARTMENT = "__none__"

/** The API wants null for "no department", never the sentinel. */
export const toDepartmentId = (value: string | undefined) =>
  !value || value === NO_DEPARTMENT ? null : value

export const createUserFormZodSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(ASSIGNABLE_ROLES, { message: "Choose a role" }),
  department_id: z.string().optional(),
})

export type ICreateUserFormValues = z.infer<typeof createUserFormZodSchema>

export const createUserServerZodSchema = createUserFormZodSchema.transform((values) => ({
  ...values,
  department_id: toDepartmentId(values.department_id),
}))

export type ICreateUserPayload = z.output<typeof createUserServerZodSchema>

// Email and password are not editable from the team screen - changing either is
// its own flow, with its own confirmation.
export const editUserFormZodSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  role: z.enum(ASSIGNABLE_ROLES, { message: "Choose a role" }),
  department_id: z.string().optional(),
  // `pending` is absent on purpose - it is set by the invite flow and cleared
  // by approval, never assigned by hand.
  status: z.enum(["active", "suspended"]).optional(),
})

export type IEditUserFormValues = z.infer<typeof editUserFormZodSchema>

export const updateUserServerZodSchema = editUserFormZodSchema.transform((values) => ({
  ...values,
  department_id: toDepartmentId(values.department_id),
}))

export type IUpdateUserPayload = z.output<typeof updateUserServerZodSchema>
