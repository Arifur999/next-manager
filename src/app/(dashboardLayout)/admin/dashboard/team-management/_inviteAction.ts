"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { approveMember, createInvite, rejectMember, revokeInvite } from "@/services/people.services"
import { createInviteServerZodSchema } from "@/zod/people.validation"

// "That person is already on your team" and "That email already has an
// account" are the server's words and say what to do instead.
export const createInviteAction = async (values: unknown) =>
    runValidatedAction(createInviteServerZodSchema, values, "Could not create the invite", createInvite)

export const revokeInviteAction = async (id: string) =>
    requireId(id, "invite") ?? runAction("Could not revoke the invite", () => revokeInvite(id))

// Approving is what charges a seat, so the plan limit surfaces here, and the
// server names the plan in its refusal.
export const approveMemberAction = async (id: string) =>
    requireId(id, "member") ?? runAction("Could not approve", () => approveMember(id))

export const rejectMemberAction = async (id: string) =>
    requireId(id, "member") ?? runAction("Could not turn the request down", () => rejectMember(id, {}))
