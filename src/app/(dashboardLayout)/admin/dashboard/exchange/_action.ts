"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createExchange, deleteExchange } from "@/services/finance.services"
import { createExchangeServerZodSchema } from "@/zod/finance.validation"

export const createExchangeAction = async (values: unknown) =>
    runValidatedAction(createExchangeServerZodSchema, values, "Failed to record exchange", createExchange)

export const deleteExchangeAction = async (id: string) =>
    requireId(id, "exchange") ?? runAction("Failed to delete exchange", () => deleteExchange(id))
