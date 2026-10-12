"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    ICapacityRow,
    ITask,
    ITaskReport,
    ITimeEntry,
    ITimeSummary,
    IWorkflowStatus,
    IWorkload,
} from "@/types/work.types"

export const getTasks = async (queryString?: string) =>
    httpClient.get<ITask[]>("/tasks", { params: toParams(queryString) })

export const createTask = async (payload: Record<string, unknown>) =>
    httpClient.post<ITask>("/tasks", payload)

export const updateTask = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ITask>(`/tasks/${id}`, payload)

export const deleteTask = async (id: string) =>
    httpClient.delete<{ message: string }>(`/tasks/${id}`)

export const getTaskReport = async (queryString?: string) =>
    httpClient.get<ITaskReport>("/tasks/report", { params: toParams(queryString) })

export const getWorkflowStatuses = async (queryString?: string) =>
    httpClient.get<IWorkflowStatus[]>("/workflow-statuses", { params: toParams(queryString) })

export const createWorkflowStatus = async (payload: Record<string, unknown>) =>
    httpClient.post<IWorkflowStatus>("/workflow-statuses", payload)

export const updateWorkflowStatus = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IWorkflowStatus>(`/workflow-statuses/${id}`, payload)

export const deleteWorkflowStatus = async (id: string) =>
    httpClient.delete<{ message: string }>(`/workflow-statuses/${id}`)

export const getTimeEntries = async (queryString?: string) =>
    httpClient.get<ITimeEntry[]>("/time-entries", { params: toParams(queryString) })

export const getTimeSummary = async (queryString?: string) =>
    httpClient.get<ITimeSummary>("/time-entries/summary", { params: toParams(queryString) })

export const createTimeEntry = async (payload: Record<string, unknown>) =>
    httpClient.post<ITimeEntry>("/time-entries", payload)

export const updateTimeEntry = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ITimeEntry>(`/time-entries/${id}`, payload)

export const deleteTimeEntry = async (id: string) =>
    httpClient.delete<{ message: string }>(`/time-entries/${id}`)

export const approveTimeEntry = async (id: string) =>
    httpClient.post<ITimeEntry>(`/time-entries/${id}/approve`, {})

export const unapproveTimeEntry = async (id: string) =>
    httpClient.post<ITimeEntry>(`/time-entries/${id}/unapprove`, {})

export const getCapacities = async () =>
    httpClient.get<ICapacityRow[]>("/time-entries/capacity")

/**
 * Weekly hours, a bill rate, or both.
 *
 * Takes a payload rather than a single number so a rate can be set without
 * touching the hours — the server only writes the fields it is sent, and
 * passing a hardcoded weekly_hours here would have undone that.
 */
export const setCapacity = async (userId: string, payload: Record<string, unknown>) =>
    httpClient.patch<ICapacityRow>(`/time-entries/capacity/${userId}`, payload)

export const getWorkload = async (queryString?: string) =>
    httpClient.get<IWorkload>("/time-entries/workload", { params: toParams(queryString) })
