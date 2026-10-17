"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { createProject, updateProject } from "@/services/project.services"
import { createProjectServerZodSchema, updateProjectServerZodSchema } from "@/zod/project.validation"

export const createProjectAction = async (values: unknown) =>
    runValidatedAction(createProjectServerZodSchema, values, "Failed to create project", createProject)

export const updateProjectAction = async (id: string, values: unknown) =>
    requireId(id, "project") ??
    runValidatedAction(updateProjectServerZodSchema, values, "Failed to update project", (payload) => updateProject(id, payload))
