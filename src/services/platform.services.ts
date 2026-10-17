"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { IInviteMail } from "@/types/common.types"
import type {
    IAgencyInvite,
    IAnnouncement,
    ICompanyRow,
    IMySubscription,
    IPlan,
    IPlatformActivity,
    IPlatformAdmin,
    IPlatformExpense,
    IPlatformFinance,
    IPlatformInvite,
    IPlatformOverview,
    IPlatformSettings,
    IPlatformTrend,
    IPublishResult,
    ISubscription,
} from "@/types/platform.types"

export const getMySubscription = async () =>
    httpClient.get<IMySubscription>("/platform/subscription")

export const getPlans = async () =>
    httpClient.get<IPlan[]>("/platform/plans")

export const createPlan = async (payload: Record<string, unknown>) =>
    httpClient.post<IPlan>("/platform/plans", payload)

export const updatePlan = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IPlan>(`/platform/plans/${id}`, payload)

export const getCompanies = async (queryString?: string) =>
    httpClient.get<ICompanyRow[]>("/platform/companies", { params: toParams(queryString) })

export const setSubscription = async (organizationId: string, payload: Record<string, unknown>) =>
    httpClient.patch<ISubscription>(
        `/platform/companies/${organizationId}/subscription`,
        payload
    )

export const getPlatformOverview = async () =>
    httpClient.get<IPlatformOverview>("/platform/overview")

export const createCompany = async (payload: Record<string, unknown>) =>
    httpClient.post("/platform/companies", payload)

export const getPlatformAdmins = async () =>
    httpClient.get<IPlatformAdmin[]>("/platform/admins")

export const setAdminPermissions = async (id: string, permissions: string[]) =>
    httpClient.patch<IPlatformAdmin>(`/platform/admins/${id}/permissions`, { permissions })

export const approvePlatformAdmin = async (id: string) =>
    httpClient.post(`/platform/admins/${id}/approve`, {})

export const removePlatformAdmin = async (id: string) =>
    httpClient.delete<{ message: string }>(`/platform/admins/${id}`)

/** Returns `join_url` — the only time the token is readable. */
export const createPlatformInvite = async (payload: Record<string, unknown>) =>
    httpClient.post<{
        invite: IPlatformInvite
        join_url: string
        email: IInviteMail
    }>("/platform/invites", payload)

export const getPlatformInvites = async () =>
    httpClient.get<IPlatformInvite[]>("/platform/invites")

export const revokePlatformInvite = async (id: string) =>
    httpClient.delete<{ message: string }>(`/platform/invites/${id}`)

export const getPlatformActivity = async (queryString?: string) =>
    httpClient.get<IPlatformActivity[]>("/platform/activity", { params: toParams(queryString) })

export const getPlatformFinance = async (queryString?: string) =>
    httpClient.get<IPlatformFinance>("/platform/finance", { params: toParams(queryString) })

export const getPlatformTrend = async (queryString?: string) =>
    httpClient.get<IPlatformTrend>("/platform/trend", { params: toParams(queryString) })

export const getPlatformExpenses = async (queryString?: string) =>
    httpClient.get<IPlatformExpense[]>("/platform/expenses", { params: toParams(queryString) })

export const createPlatformExpense = async (payload: Record<string, unknown>) =>
    httpClient.post<IPlatformExpense>("/platform/expenses", payload)

export const deletePlatformExpense = async (id: string) =>
    httpClient.delete<{ message: string }>(`/platform/expenses/${id}`)

export const getAnnouncements = async () =>
    httpClient.get<IAnnouncement[]>("/platform/announcements")

export const createAnnouncement = async (payload: Record<string, unknown>) =>
    httpClient.post<IAnnouncement>("/platform/announcements", payload)

export const updateAnnouncement = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IAnnouncement>(`/platform/announcements/${id}`, payload)

export const publishAnnouncement = async (id: string) =>
    httpClient.post<IPublishResult>(`/platform/announcements/${id}/publish`, {})

export const deleteAnnouncement = async (id: string) =>
    httpClient.delete<{ id: string }>(`/platform/announcements/${id}`)

export const getPlatformSettings = async () =>
    httpClient.get<IPlatformSettings>("/platform/settings")

export const updatePlatformSettings = async (payload: Record<string, unknown>) =>
    httpClient.patch<IPlatformSettings>("/platform/settings", payload)

export const getAgencyInvites = async () =>
    httpClient.get<IAgencyInvite[]>("/platform/agency-invites")

export const createAgencyInvite = async (payload: Record<string, unknown>) =>
    httpClient.post<{
        invite: IAgencyInvite
        join_url: string
        email: IInviteMail
    }>("/platform/agency-invites", payload)

export const revokeAgencyInvite = async (id: string) =>
    httpClient.delete<{ message: string }>(`/platform/agency-invites/${id}`)
