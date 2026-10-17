"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    IClient,
    IClientDetail,
    IClientFinancials,
    IClientLink,
    ILeadPipeline,
    ILeadSource,
    ILeadStageEvent,
} from "@/types/crm.types"

export const getClients = async (queryString?: string) =>
    httpClient.get<IClient[]>("/clients", { params: toParams(queryString) })

export const getClient = async (id: string) =>
    httpClient.get<IClientDetail>(`/clients/${id}`)

export const getClientFinancials = async (id: string) =>
    httpClient.get<IClientFinancials>(`/clients/${id}/financials`)

export const createClient = async (payload: Record<string, unknown>) =>
    httpClient.post<IClient>("/clients", payload)

export const updateClient = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IClient>(`/clients/${id}`, payload)

export const deleteClient = async (id: string) =>
    httpClient.delete<{ message: string }>(`/clients/${id}`)

export const getLeadPipeline = async (queryString?: string) =>
    httpClient.get<ILeadPipeline>("/leads", { params: toParams(queryString) })

export const createLead = async (payload: Record<string, unknown>) =>
    httpClient.post("/leads", payload)

export const updateLead = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch(`/leads/${id}`, payload)

export const convertLead = async (id: string) =>
    httpClient.post<IClient>(`/leads/${id}/convert`, {})

export const deleteLead = async (id: string) =>
    httpClient.delete(`/leads/${id}`)

export const getLeadStageEvents = async (leadId: string) =>
    httpClient.get<ILeadStageEvent[]>(`/leads/${leadId}/stage-events`)

export const getLeadSources = async () =>
    httpClient.get<ILeadSource[]>("/lead-sources")

export const createLeadSource = async (payload: Record<string, unknown>) =>
    httpClient.post<ILeadSource>("/lead-sources", payload)

export const updateLeadSource = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ILeadSource>(`/lead-sources/${id}`, payload)

export const getClientLinks = async (queryString?: string) =>
    httpClient.get<IClientLink[]>("/client-links", { params: toParams(queryString) })

export const createClientLink = async (payload: Record<string, unknown>) =>
    httpClient.post<IClientLink>("/client-links", payload)

export const deleteClientLink = async (id: string) =>
    httpClient.delete<{ message: string }>(`/client-links/${id}`)
