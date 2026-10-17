"use server"

import { runAction, runValidatedAction } from "@/lib/runAction"
import { clockAttendance, recordAttendance } from "@/services/people.services"
import { recordAttendanceServerZodSchema } from "@/zod/people.validation"

// "You have already checked out today" is the server's refusal, shown as it is.
export const clockAction = async () => runAction("Could not record that", clockAttendance)

// Whether check-out comes after check-in is the server's call.
export const recordAttendanceAction = async (values: unknown) =>
    runValidatedAction(recordAttendanceServerZodSchema, values, "Could not record it", recordAttendance)
