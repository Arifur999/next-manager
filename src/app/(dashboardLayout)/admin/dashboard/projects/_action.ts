"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { assignProjectMember, createProject, removeProjectMember, updateProject } from "@/services/project.services"
import {
    assignProjectMemberServerZodSchema,
    createProjectServerZodSchema,
    updateProjectServerZodSchema,
} from "@/zod/project.validation"

export const createProjectAction = async (values: unknown) =>
    runValidatedAction(createProjectServerZodSchema, values, "Failed to create project", createProject)

export const updateProjectAction = async (id: string, values: unknown) =>
    requireId(id, "project") ??
    runValidatedAction(updateProjectServerZodSchema, values, "Failed to update project", (payload) => updateProject(id, payload))

export const assignProjectMemberAction = async (values: unknown) =>
    runValidatedAction(assignProjectMemberServerZodSchema, values, "Failed to assign", assignProjectMember)

export const removeProjectMemberAction = async (id: string) =>
    requireId(id, "member") ?? runAction("Failed to remove", () => removeProjectMember(id))
