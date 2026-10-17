"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    convertLead,
    createLead,
    createLeadSource,
    deleteLead,
    deleteLeadSource,
    updateLead,
    updateLeadSource,
} from "@/services/crm.services"
import {
    createLeadServerZodSchema,
    createLeadSourceServerZodSchema,
    moveLeadServerZodSchema,
    updateLeadServerZodSchema,
    updateLeadSourceServerZodSchema,
} from "@/zod/crm.validation"

export const createLeadAction = async (values: unknown) =>
    runValidatedAction(createLeadServerZodSchema, values, "Failed to create lead", createLead)

export const updateLeadAction = async (id: string, values: unknown) =>
    requireId(id, "lead") ??
    runValidatedAction(updateLeadServerZodSchema, values, "Failed to update lead", (payload) => updateLead(id, payload))

export const moveLeadAction = async (id: string, values: unknown) =>
    requireId(id, "lead") ??
    runValidatedAction(moveLeadServerZodSchema, values, "Failed to move lead", (payload) => updateLead(id, payload))

export const convertLeadAction = async (id: string) =>
    requireId(id, "lead") ?? runAction("Failed to convert lead", () => convertLead(id))

export const deleteLeadAction = async (id: string) =>
    requireId(id, "lead") ?? runAction("Failed to delete lead", () => deleteLead(id))

export const createLeadSourceAction = async (values: unknown) =>
    runValidatedAction(createLeadSourceServerZodSchema, values, "Failed to add the source", createLeadSource)

export const updateLeadSourceAction = async (id: string, values: unknown) =>
    requireId(id, "lead source") ??
    runValidatedAction(updateLeadSourceServerZodSchema, values, "Failed to change the source", (payload) =>
        updateLeadSource(id, payload),
    )

export const deleteLeadSourceAction = async (id: string) =>
    requireId(id, "lead source") ?? runAction("Failed to delete the source", () => deleteLeadSource(id))
