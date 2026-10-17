"use server"

import { requireId, runAction, runValidatedAction } from "@/lib/runAction"
import {
    createService,
    createServiceCategory,
    createServiceTemplate,
    deleteService,
    deleteServiceCategory,
    deleteServiceTemplate,
    updateService,
    updateServiceCategory,
} from "@/services/catalog.services"
import {
    activeStateServerZodSchema,
    serviceCategoryServerZodSchema,
    serviceServerZodSchema,
    serviceTemplateServerZodSchema,
} from "@/zod/catalog.validation"

export const createServiceAction = async (values: unknown) =>
    runValidatedAction(serviceServerZodSchema, values, "Could not add it", createService)

export const updateServiceAction = async (id: string, values: unknown) =>
    requireId(id, "service") ??
    runValidatedAction(serviceServerZodSchema, values, "Could not change it", (payload) =>
        updateService(id, payload),
    )

export const setServiceActiveAction = async (id: string, values: unknown) =>
    requireId(id, "service") ??
    runValidatedAction(activeStateServerZodSchema, values, "Could not change it", (payload) =>
        updateService(id, payload),
    )

// A service already on invoice lines is refused with "turn it off instead",
// which keeps their history readable.
export const deleteServiceAction = async (id: string) =>
    requireId(id, "service") ?? runAction("Could not remove it", () => deleteService(id))

export const createCategoryAction = async (values: unknown) =>
    runValidatedAction(serviceCategoryServerZodSchema, values, "Could not add it", createServiceCategory)

export const setCategoryActiveAction = async (id: string, values: unknown) =>
    requireId(id, "category") ??
    runValidatedAction(activeStateServerZodSchema, values, "Could not change it", (payload) =>
        updateServiceCategory(id, payload),
    )

export const deleteCategoryAction = async (id: string) =>
    requireId(id, "category") ?? runAction("Could not remove it", () => deleteServiceCategory(id))

export const createTemplateAction = async (values: unknown) =>
    runValidatedAction(serviceTemplateServerZodSchema, values, "Could not create it", createServiceTemplate)

export const deleteTemplateAction = async (id: string) =>
    requireId(id, "package") ?? runAction("Could not remove it", () => deleteServiceTemplate(id))
