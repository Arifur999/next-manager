"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { INotification } from "@/types/platform.types"
import type {
    IActivityEntry,
    IActivityFilters,
    IConversation,
    ICredential,
    ICredentialAccessEntry,
    ILoginEvent,
    IMessage,
    INotificationRule,
    IOrganization,
    IRevealedCredential,
} from "@/types/workspace.types"

export const getOrganization = async () =>
    httpClient.get<IOrganization>("/settings/organization")

export const updateOrganization = async (payload: Record<string, unknown>) =>
    httpClient.patch<IOrganization>("/settings/organization", payload)

export const getNotificationRules = async () =>
    httpClient.get<INotificationRule[]>("/notification-rules")

export const setNotificationRule = async (event: string, payload: Record<string, unknown>) =>
    httpClient.patch<INotificationRule>(`/notification-rules/${event}`, payload)

export const getNotifications = async () =>
    httpClient.get<INotification[]>("/notifications")

export const getUnreadCount = async () =>
    httpClient.get<{ unread: number }>("/notifications/unread-count")

export const markNotificationRead = async (id: string) =>
    httpClient.post<{ id: string }>(`/notifications/${id}/read`, {})

export const markAllNotificationsRead = async () =>
    httpClient.post<{ marked: number }>("/notifications/read-all", {})

export const getLoginEvents = async (queryString?: string) =>
    httpClient.get<ILoginEvent[]>("/security/login-events", { params: toParams(queryString) })

export const getActivity = async (queryString?: string) =>
    httpClient.get<IActivityEntry[]>("/activity", { params: toParams(queryString) })

export const getActivityFilters = async () =>
    httpClient.get<IActivityFilters>("/activity/filters")

export const getCredentials = async (queryString?: string) =>
    httpClient.get<ICredential[]>("/vault", { params: toParams(queryString) })

export const createCredential = async (payload: Record<string, unknown>) =>
    httpClient.post<ICredential>("/vault", payload)

/** The only call that returns a real password — and the server logs every one. */
export const revealCredential = async (id: string) =>
    httpClient.get<IRevealedCredential>(`/vault/${id}/reveal`)

export const getCredentialAccessLog = async (id: string) =>
    httpClient.get<ICredentialAccessEntry[]>(`/vault/${id}/access-log`)

export const getConversations = async (queryString?: string) =>
    httpClient.get<IConversation[]>("/chat", { params: toParams(queryString) })

export const createConversation = async (payload: Record<string, unknown>) =>
    httpClient.post<{ id: string }>("/chat", payload)

export const getMessages = async (id: string) =>
    httpClient.get<IMessage[]>(`/chat/${id}/messages`)

export const sendMessage = async (id: string, payload: Record<string, unknown>) =>
    httpClient.post<IMessage>(`/chat/${id}/messages`, payload)

export const markConversationRead = async (id: string) =>
    httpClient.post<{ message: string }>(`/chat/${id}/read`, {})

export const setConversationArchived = async (id: string, archived: boolean) =>
    httpClient.post<{ message: string }>(`/chat/${id}/archive`, { archived })
