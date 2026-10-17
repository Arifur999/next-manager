"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    addConversationMembers,
    createConversation,
    leaveConversation,
    markConversationRead,
    sendMessage,
    setConversationArchived,
} from "@/services/workspace.services"
import {
    addMembersServerZodSchema,
    createConversationServerZodSchema,
    sendMessageServerZodSchema,
} from "@/zod/workspace.validation"

// "Somebody on that list is not on your team" arrives here: the server checks
// every id against this agency before writing a single row.
export const createConversationAction = async (values: unknown) =>
    runValidatedAction(createConversationServerZodSchema, values, "Could not start it", createConversation)

export const sendMessageAction = async (id: string, values: unknown) =>
    requireId(id, "conversation") ??
    runValidatedAction(sendMessageServerZodSchema, values, "Could not send it", (payload) => sendMessage(id, payload))

export const markConversationReadAction = async (id: string) =>
    requireId(id, "conversation") ?? runAction("Could not mark it read", () => markConversationRead(id))

export const setConversationArchivedAction = async (id: string, archived: boolean) =>
    requireId(id, "conversation") ??
    runAction("Could not archive it", () => setConversationArchived(id, archived))

export const addConversationMembersAction = async (id: string, values: unknown) =>
    requireId(id, "conversation") ??
    runValidatedAction(addMembersServerZodSchema, values, "Could not add them", (payload) =>
        addConversationMembers(id, payload),
    )

export const leaveConversationAction = async (id: string) =>
    requireId(id, "conversation") ?? runAction("Could not leave it", () => leaveConversation(id))
