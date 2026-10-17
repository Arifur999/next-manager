"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { isMissingRecordError } from "@/lib/apiFailure"
import { toParams } from "@/lib/queryString"
import type {
    IAssignmentRow,
    IMilestone,
    IProject,
    IProjectFinancials,
    IProjectLink,
    IProjectMember,
} from "@/types/project.types"

export const getProjects = async (queryString?: string) =>
    httpClient.get<IProject[]>("/projects", { params: toParams(queryString) })

// Null when there is no such project for this company (or it is not theirs to
// see), so the page can say so instead of retrying.
export const getProject = async (id: string) => {
    try {
        return await httpClient.get<IProject>(`/projects/${id}`)
    } catch (error) {
        if (isMissingRecordError(error)) return null
        throw error
    }
}

export const getProjectFinancials = async (id: string) =>
    httpClient.get<IProjectFinancials>(`/projects/${id}/financials`)

export const createProject = async (payload: Record<string, unknown>) =>
    httpClient.post<IProject>("/projects", payload)

export const updateProject = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IProject>(`/projects/${id}`, payload)

export const deleteProject = async (id: string) =>
    httpClient.delete<{ message: string }>(`/projects/${id}`)

export const getProjectMembers = async (projectId: string) =>
    httpClient.get<IProjectMember[]>(`/project-members/${projectId}`)

export const getAssignmentOverview = async () =>
    httpClient.get<IAssignmentRow[]>("/project-members/overview")

export const assignProjectMember = async (payload: Record<string, unknown>) =>
    httpClient.post<IProjectMember>("/project-members", payload)

export const removeProjectMember = async (id: string) =>
    httpClient.delete<{ message: string }>(`/project-members/${id}`)

export const getMilestones = async (queryString?: string) =>
    httpClient.get<IMilestone[]>("/milestones", { params: toParams(queryString) })

export const createMilestone = async (payload: Record<string, unknown>) =>
    httpClient.post<IMilestone>("/milestones", payload)

export const updateMilestone = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IMilestone>(`/milestones/${id}`, payload)

export const submitMilestone = async (id: string) =>
    httpClient.post<IMilestone>(`/milestones/${id}/submit`, {})

export const acceptMilestone = async (id: string) =>
    httpClient.post<IMilestone>(`/milestones/${id}/accept`, {})

export const reopenMilestone = async (id: string) =>
    httpClient.post<IMilestone>(`/milestones/${id}/reopen`, {})

export const deleteMilestone = async (id: string) =>
    httpClient.delete<{ message: string }>(`/milestones/${id}`)

/**
 * Freeze the plan a project is measured against.
 *
 * Separate from updateProject on purpose — the contract value is meant to move
 * and the baseline is not, and one endpoint for both would let the baseline
 * drift on every save.
 */
export const setProjectBaseline = async (projectId: string, payload: Record<string, unknown>) =>
    httpClient.post<IProject>(`/projects/${projectId}/baseline`, payload)

export const getProjectLinks = async (queryString?: string) =>
    httpClient.get<IProjectLink[]>("/project-links", { params: toParams(queryString) })

export const createProjectLink = async (payload: Record<string, unknown>) =>
    httpClient.post<IProjectLink>("/project-links", payload)

export const updateProjectLink = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IProjectLink>(`/project-links/${id}`, payload)

export const deleteProjectLink = async (id: string) =>
    httpClient.delete<{ message: string }>(`/project-links/${id}`)
