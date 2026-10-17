"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    updateAnnouncement,
} from "@/services/platform.services"
import { announcementServerZodSchema } from "@/zod/platform.validation"

export const createAnnouncementAction = async (values: unknown) =>
    runValidatedAction(announcementServerZodSchema, values, "Could not save the draft", createAnnouncement)

// "This one has already gone out, so it cannot be edited" arrives here and says what to do instead.
export const updateAnnouncementAction = async (id: string, values: unknown) =>
    requireId(id, "announcement") ??
    runValidatedAction(announcementServerZodSchema, values, "Could not update the draft", (payload) =>
        updateAnnouncement(id, payload),
    )

export const publishAnnouncementAction = async (id: string) =>
    requireId(id, "announcement") ?? runAction("Could not publish", () => publishAnnouncement(id))

export const deleteAnnouncementAction = async (id: string) =>
    requireId(id, "announcement") ?? runAction("Could not remove it", () => deleteAnnouncement(id))
