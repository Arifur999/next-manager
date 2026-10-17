"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createTask, deleteTask, updateTask } from "@/services/work.services"
import {
    createTaskServerZodSchema,
    moveTaskServerZodSchema,
    updateOwnTaskServerZodSchema,
    updateTaskServerZodSchema,
} from "@/zod/work.validation"

export const createTaskAction = async (values: unknown) =>
    runValidatedAction(createTaskServerZodSchema, values, "Failed to create task", createTask)

export const moveTaskAction = async (id: string, values: unknown) =>
    requireId(id, "task") ??
    runValidatedAction(moveTaskServerZodSchema, values, "Failed to update task", (payload) => updateTask(id, payload))

// The API names a refused assignment ("Ask an admin to allow: tasks — assign"),
// so its message comes straight through.
export const updateTaskAction = async (id: string, values: unknown) =>
    requireId(id, "task") ??
    runValidatedAction(updateTaskServerZodSchema, values, "Failed to save task", (payload) => updateTask(id, payload))

export const updateOwnTaskAction = async (id: string, values: unknown) =>
    requireId(id, "task") ??
    runValidatedAction(updateOwnTaskServerZodSchema, values, "Failed to save task", (payload) => updateTask(id, payload))

export const deleteTaskAction = async (id: string) =>
    requireId(id, "task") ?? runAction("Failed to delete task", () => deleteTask(id))
