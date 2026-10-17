"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createDepartment, deleteDepartment, updateDepartment } from "@/services/people.services"
import { activeStateServerZodSchema, departmentServerZodSchema } from "@/zod/people.validation"

// Names are unique case-insensitively, so "design" is refused while "Design"
// exists, and the server's message says so.
export const createDepartmentAction = async (values: unknown) =>
    runValidatedAction(departmentServerZodSchema, values, "Could not create it", createDepartment)

export const updateDepartmentAction = async (id: string, values: unknown) =>
    requireId(id, "department") ??
    runValidatedAction(departmentServerZodSchema, values, "Could not update it", (payload) =>
        updateDepartment(id, payload),
    )

export const setDepartmentActiveAction = async (id: string, values: unknown) =>
    requireId(id, "department") ??
    runValidatedAction(activeStateServerZodSchema, values, "Could not update it", (payload) =>
        updateDepartment(id, payload),
    )

// A department with people in it is refused with "move them first, or turn it
// off instead", which is shown as it is.
export const deleteDepartmentAction = async (id: string) =>
    requireId(id, "department") ?? runAction("Could not delete it", () => deleteDepartment(id))
