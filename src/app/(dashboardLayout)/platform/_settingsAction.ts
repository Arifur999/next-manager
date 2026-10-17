"use server"

import { runValidatedAction } from "@/lib/runAction"
import { updatePlatformSettings } from "@/services/platform.services"
import { platformSettingsServerZodSchema } from "@/zod/platform.validation"

// "That plan does not exist, or is not on sale" arrives here.
export const updateSettingsAction = async (values: unknown) =>
    runValidatedAction(platformSettingsServerZodSchema, values, "Could not save the settings", updatePlatformSettings)
