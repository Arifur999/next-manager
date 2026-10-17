"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { convertLead, createLead, updateLead } from "@/services/crm.services"
import { createLeadServerZodSchema, moveLeadServerZodSchema } from "@/zod/crm.validation"

export const createLeadAction = async (values: unknown) =>
    runValidatedAction(createLeadServerZodSchema, values, "Failed to create lead", createLead)

export const moveLeadAction = async (id: string, values: unknown) =>
    requireId(id, "lead") ??
    runValidatedAction(moveLeadServerZodSchema, values, "Failed to move lead", (payload) => updateLead(id, payload))

export const convertLeadAction = async (id: string) =>
    requireId(id, "lead") ?? runAction("Failed to convert lead", () => convertLead(id))
