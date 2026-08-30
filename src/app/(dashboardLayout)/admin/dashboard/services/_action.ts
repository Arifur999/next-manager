"use server"

import { getActionErrorMessage } from "@/lib/actionError"
import {
    createService,
    createServiceCategory,
    createServiceTemplate,
    deleteService,
    deleteServiceCategory,
    deleteServiceTemplate,
    updateService,
    updateServiceCategory,
} from "@/services/agencio.services"
import type { IService, IServiceCategory, IServiceTemplate } from "@/types/agencio.types"
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types"

const fail = (error: unknown, fallback: string): ApiErrorResponse => ({
    success: false,
    message: getActionErrorMessage(error, fallback),
})

export const createServiceAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IService> | ApiErrorResponse> => {
    try {
        return await createService(payload)
    } catch (error: unknown) {
        return fail(error, "Could not add it")
    }
}

export const updateServiceAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IService> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid service id" }

    try {
        return await updateService(id, payload)
    } catch (error: unknown) {
        return fail(error, "Could not change it")
    }
}

export const deleteServiceAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid service id" }

    try {
        return await deleteService(id)
    } catch (error: unknown) {
        // "…is on 4 invoice lines. Turn it off instead of deleting it, so their
        // history survives." arrives here and already says what to do.
        return fail(error, "Could not remove it")
    }
}

export const createCategoryAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IServiceCategory> | ApiErrorResponse> => {
    try {
        return await createServiceCategory(payload)
    } catch (error: unknown) {
        return fail(error, "Could not add it")
    }
}

export const updateCategoryAction = async (
    id: string,
    payload: Record<string, unknown>,
): Promise<ApiResponse<IServiceCategory> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid category id" }

    try {
        return await updateServiceCategory(id, payload)
    } catch (error: unknown) {
        return fail(error, "Could not change it")
    }
}

export const deleteCategoryAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid category id" }

    try {
        return await deleteServiceCategory(id)
    } catch (error: unknown) {
        return fail(error, "Could not remove it")
    }
}

export const createTemplateAction = async (
    payload: Record<string, unknown>,
): Promise<ApiResponse<IServiceTemplate> | ApiErrorResponse> => {
    try {
        return await createServiceTemplate(payload)
    } catch (error: unknown) {
        return fail(error, "Could not create it")
    }
}

export const deleteTemplateAction = async (
    id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
    if (!id) return { success: false, message: "Invalid package id" }

    try {
        return await deleteServiceTemplate(id)
    } catch (error: unknown) {
        return fail(error, "Could not remove it")
    }
}
