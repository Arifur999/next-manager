"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { IInviteMail } from "@/types/common.types"
import type {
    IAttendance,
    IDepartment,
    ILeaveBalance,
    ILeaveRequest,
    ILeaveType,
    IPayrollRun,
    ITeamInvite,
} from "@/types/people.types"

export const getAttendance = async (queryString?: string) =>
    httpClient.get<IAttendance[]>("/hr/attendance", { params: toParams(queryString) })

export const clockAttendance = async () =>
    httpClient.post<IAttendance>("/hr/attendance/clock", {})

export const recordAttendance = async (payload: Record<string, unknown>) =>
    httpClient.post<IAttendance>("/hr/attendance", payload)

export const getLeaveTypes = async () =>
    httpClient.get<ILeaveType[]>("/hr/leave-types")

export const createLeaveType = async (payload: Record<string, unknown>) =>
    httpClient.post<ILeaveType>("/hr/leave-types", payload)

// Retiring a kind is `is_active: false`, never a delete: leave already
// approved against it has to keep saying what it was for.
export const updateLeaveType = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ILeaveType>(`/hr/leave-types/${id}`, payload)

export const getLeaveRequests = async (queryString?: string) =>
    httpClient.get<ILeaveRequest[]>("/hr/leave", { params: toParams(queryString) })

export const getLeaveBalance = async (queryString?: string) =>
    httpClient.get<ILeaveBalance[]>("/hr/leave/balance", { params: toParams(queryString) })

export const requestLeave = async (payload: Record<string, unknown>) =>
    httpClient.post<ILeaveRequest>("/hr/leave", payload)

export const cancelLeave = async (id: string) =>
    httpClient.post<ILeaveRequest>(`/hr/leave/${id}/cancel`, {})

export const decideLeave = async (id: string, payload: Record<string, unknown>) =>
    httpClient.post<ILeaveRequest>(`/hr/leave/${id}/decide`, payload)

export const getPayrollRuns = async () =>
    httpClient.get<IPayrollRun[]>("/hr/payroll")

export const createPayrollRun = async (payload: Record<string, unknown>) =>
    httpClient.post<IPayrollRun>("/hr/payroll", payload)

export const setPayrollItems = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IPayrollRun>(`/hr/payroll/${id}/items`, payload)

export const completePayroll = async (id: string, payload: Record<string, unknown>) =>
    httpClient.post<IPayrollRun>(`/hr/payroll/${id}/complete`, payload)

export const deletePayrollRun = async (id: string) =>
    httpClient.delete<{ message: string }>(`/hr/payroll/${id}`)

export const getDepartments = async () =>
    httpClient.get<IDepartment[]>("/departments")

export const createDepartment = async (payload: Record<string, unknown>) =>
    httpClient.post<IDepartment>("/departments", payload)

export const updateDepartment = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IDepartment>(`/departments/${id}`, payload)

export const deleteDepartment = async (id: string) =>
    httpClient.delete<{ message: string }>(`/departments/${id}`)

/** Returns `join_url` — the only time the token is ever readable. */
export const createInvite = async (payload: Record<string, unknown>) =>
    httpClient.post<{ invite: ITeamInvite; join_url: string; email: IInviteMail }>("/team-invites", payload)

export const getInvites = async () =>
    httpClient.get<ITeamInvite[]>("/team-invites")

export const revokeInvite = async (id: string) =>
    httpClient.delete<{ message: string }>(`/team-invites/${id}`)

export const approveMember = async (id: string) =>
    httpClient.post(`/team-invites/members/${id}/approve`, {})

export const rejectMember = async (id: string, payload: Record<string, unknown>) =>
    httpClient.post(`/team-invites/members/${id}/reject`, payload)
