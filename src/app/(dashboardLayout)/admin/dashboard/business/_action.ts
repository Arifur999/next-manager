"use server"

import { runValidatedAction } from "@/lib/runAction"
import { updateOrganization } from "@/services/workspace.services"
import { updateOrganizationServerZodSchema } from "@/zod/workspace.validation"

export const updateOrganizationAction = async (values: unknown) =>
    runValidatedAction(updateOrganizationServerZodSchema, values, "Failed to update the profile", updateOrganization)
