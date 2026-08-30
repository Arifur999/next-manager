import { z } from "zod"

// Mirrors the backend's assignableRoles: super_admin is a platform role and
// cannot be granted from inside a company. admin CAN be granted - a company
// may want a second one, and the last-admin guard makes that safe.
export const ASSIGNABLE_ROLES = ["admin", "sales", "project_manager", "operations"] as const

export const ROLE_LABELS: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
  admin: "Admin — finance and company state",
  sales: "Sales — clients, leads, invoices",
  project_manager: "Project manager — projects, teams, schedule",
  operations: "Operations — does the work, logs time",
}

const assignableRoles = ASSIGNABLE_ROLES

export const createUserFormZodSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(assignableRoles, { message: "Choose a role" }),
  // The sentinel for "no department", because a Select cannot hold "" and
  // null is a real answer here: somebody can work across all of them.
  department_id: z.string().optional(),
})

export type ICreateUserFormValues = z.infer<typeof createUserFormZodSchema>

// Email and password are not editable from the team screen - changing either is
// its own flow, with its own confirmation.
export const editUserFormZodSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  role: z.enum(assignableRoles, { message: "Choose a role" }),
  // The sentinel for "no department", because a Select cannot hold "" and
  // null is a real answer here: somebody can work across all of them.
  department_id: z.string().optional(),
  // `pending` is absent on purpose - it is set by the invite flow and cleared
  // by approval, never assigned by hand.
  status: z.enum(["active", "suspended"]).optional(),
})

export type IEditUserFormValues = z.infer<typeof editUserFormZodSchema>
