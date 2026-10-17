"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { createClient, deleteClient, updateClient } from "@/services/crm.services"
import { clientServerZodSchema } from "@/zod/crm.validation"

export const createClientAction = async (values: unknown) =>
    runValidatedAction(clientServerZodSchema, values, "Failed to create client", createClient)

export const updateClientAction = async (id: string, values: unknown) =>
    requireId(id, "client") ??
    runValidatedAction(clientServerZodSchema, values, "Failed to update client", (payload) => updateClient(id, payload))

export const deleteClientAction = async (id: string) =>
    requireId(id, "client") ?? runAction("Failed to delete client", () => deleteClient(id))
