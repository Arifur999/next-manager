"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import { completePayroll, createPayrollRun, deletePayrollRun, setPayrollItems } from "@/services/people.services"
import {
    completePayrollServerZodSchema,
    createPayrollRunServerZodSchema,
    setPayrollItemsServerZodSchema,
} from "@/zod/people.validation"

// A second draft for a month that already has one is refused by name.
export const createPayrollRunAction = async (values: unknown) =>
    runValidatedAction(createPayrollRunServerZodSchema, values, "Could not open it", createPayrollRun)

export const setPayrollItemsAction = async (id: string, values: unknown) =>
    requireId(id, "payroll") ??
    runValidatedAction(setPayrollItemsServerZodSchema, values, "Could not save it", (payload) =>
        setPayrollItems(id, payload),
    )

export const completePayrollAction = async (id: string, values: unknown) =>
    requireId(id, "payroll") ??
    runValidatedAction(completePayrollServerZodSchema, values, "Could not pay it", (payload) =>
        completePayroll(id, payload),
    )

// A paid run is refused: its payouts are reversed where they live.
export const deletePayrollRunAction = async (id: string) =>
    requireId(id, "payroll") ?? runAction("Could not discard it", () => deletePayrollRun(id))
