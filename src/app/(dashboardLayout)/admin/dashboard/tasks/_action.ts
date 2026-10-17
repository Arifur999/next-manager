"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { createTask, updateTask } from "@/services/work.services"
import { createTaskServerZodSchema, moveTaskServerZodSchema } from "@/zod/work.validation"

export const createTaskAction = async (values: unknown) =>
    runValidatedAction(createTaskServerZodSchema, values, "Failed to create task", createTask)

export const moveTaskAction = async (id: string, values: unknown) =>
    requireId(id, "task") ??
    runValidatedAction(moveTaskServerZodSchema, values, "Failed to update task", (payload) => updateTask(id, payload))
