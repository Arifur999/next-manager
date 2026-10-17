"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    IService,
    IServiceCategory,
    IServiceDetail,
    IServiceRevenue,
    IServiceTemplate,
} from "@/types/catalog.types"

export const getServices = async (queryString?: string) =>
    httpClient.get<IService[]>("/services", { params: toParams(queryString) })

export const getService = async (id: string) =>
    httpClient.get<IServiceDetail>(`/services/${id}`)

export const createService = async (payload: Record<string, unknown>) =>
    httpClient.post<IService>("/services", payload)

export const updateService = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IService>(`/services/${id}`, payload)

export const deleteService = async (id: string) =>
    httpClient.delete<{ message: string }>(`/services/${id}`)

export const getServiceRevenue = async () =>
    httpClient.get<IServiceRevenue[]>("/services/revenue")

export const getServiceCategories = async () =>
    httpClient.get<IServiceCategory[]>("/services/categories")

export const createServiceCategory = async (payload: Record<string, unknown>) =>
    httpClient.post<IServiceCategory>("/services/categories", payload)

export const updateServiceCategory = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IServiceCategory>(`/services/categories/${id}`, payload)

export const deleteServiceCategory = async (id: string) =>
    httpClient.delete<{ message: string }>(`/services/categories/${id}`)

export const getServiceTemplates = async () =>
    httpClient.get<IServiceTemplate[]>("/services/templates")

export const createServiceTemplate = async (payload: Record<string, unknown>) =>
    httpClient.post<IServiceTemplate>("/services/templates", payload)

export const updateServiceTemplate = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IServiceTemplate>(`/services/templates/${id}`, payload)

export const deleteServiceTemplate = async (id: string) =>
    httpClient.delete<{ message: string }>(`/services/templates/${id}`)
