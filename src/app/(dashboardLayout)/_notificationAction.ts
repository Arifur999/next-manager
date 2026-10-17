"use server"

import { requireId, runAction } from "@/lib/runAction"
import { markAllNotificationsRead, markNotificationRead } from "@/services/workspace.services"

// The bell in the dashboard header, for every role: a notice from the platform
// or from the company is marked read the same way.

export const markNotificationReadAction = async (id: string) =>
    requireId(id, "notification") ?? runAction("Could not mark it read", () => markNotificationRead(id))

export const markAllNotificationsReadAction = async () =>
    runAction("Could not mark them read", () => markAllNotificationsRead())
