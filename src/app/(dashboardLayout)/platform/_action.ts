"use server"

import { requireId, runValidatedAction } from "@/lib/runAction"
import { createCompany, createPlan, reorderPlans, setSubscription, updatePlan } from "@/services/platform.services"
import {
    createCompanyServerZodSchema,
    createPlanServerZodSchema,
    planMovesServerZodSchema,
    setSubscriptionServerZodSchema,
    updatePlanServerZodSchema,
} from "@/zod/platform.validation"

export const setSubscriptionAction = async (organizationId: string, values: unknown) =>
    requireId(organizationId, "company") ??
    runValidatedAction(setSubscriptionServerZodSchema, values, "Could not update the subscription", (payload) =>
        setSubscription(organizationId, payload),
    )

// A duplicate code is refused by name, and the message says what to do instead.
export const createPlanAction = async (values: unknown) =>
    runValidatedAction(createPlanServerZodSchema, values, "Could not create the plan", createPlan)

export const updatePlanAction = async (id: string, values: unknown) =>
    requireId(id, "plan") ??
    runValidatedAction(updatePlanServerZodSchema, values, "Could not update the plan", (payload) =>
        updatePlan(id, payload),
    )

export const reorderPlansAction = async (moves: unknown) =>
    runValidatedAction(planMovesServerZodSchema, moves, "Could not reorder the plans", reorderPlans)

// "One address cannot admin two companies" is the server's wording and says what to change.
export const createCompanyAction = async (values: unknown) =>
    runValidatedAction(createCompanyServerZodSchema, values, "Could not create the company", createCompany)
