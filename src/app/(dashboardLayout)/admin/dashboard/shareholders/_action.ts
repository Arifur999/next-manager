"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createDistribution,
    createShareholder,
    deleteDistribution,
    deleteShareholder,
    updateShareholder,
} from "@/services/finance.services"
import { createDistributionServerZodSchema, createShareholderServerZodSchema } from "@/zod/finance.validation"
import { activeStateServerZodSchema } from "@/zod/formFields"

// The API's refusals already say what to do ("Shares would total 120%. The
// others already hold 90%.", "has distributions recorded"), so they reach the
// toast as sent.

export const createShareholderAction = async (values: unknown) =>
    runValidatedAction(createShareholderServerZodSchema, values, "Could not add them", createShareholder)

// Retiring and bringing back is the one change a screen makes to a shareholder.
export const updateShareholderAction = async (id: string, values: unknown) =>
    requireId(id, "shareholder") ??
    runValidatedAction(activeStateServerZodSchema, values, "Could not update them", (payload) =>
        updateShareholder(id, payload),
    )

export const deleteShareholderAction = async (id: string) =>
    requireId(id, "shareholder") ?? runAction("Could not delete them", () => deleteShareholder(id))

export const createDistributionAction = async (values: unknown) =>
    runValidatedAction(createDistributionServerZodSchema, values, "Could not record it", createDistribution)

export const deleteDistributionAction = async (id: string) =>
    requireId(id, "distribution") ?? runAction("Could not reverse it", () => deleteDistribution(id))
