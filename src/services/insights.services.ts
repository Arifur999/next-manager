"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { IDashboard, IKpiTarget, IMonthlyPoint, IProfitAndLoss } from "@/types/insights.types"
import type { KpiScope } from "@/types/kpi.types"

export const getDashboard = async () =>
    httpClient.get<IDashboard>("/dashboard")

export const getProfitAndLoss = async (queryString?: string) =>
    httpClient.get<IProfitAndLoss>("/reports/profit-loss", { params: toParams(queryString) })

export const getMonthlySeries = async (months = 12) =>
    httpClient.get<IMonthlyPoint[]>("/reports/monthly", { params: { months } })

export const getClientRevenue = async (queryString?: string) =>
    httpClient.get("/reports/client-revenue", { params: toParams(queryString) })

export const getProjectProfitability = async (queryString?: string) =>
    httpClient.get("/reports/project-profitability", { params: toParams(queryString) })

export const getCashFlow = async (queryString?: string) =>
    httpClient.get("/reports/cash-flow", { params: toParams(queryString) })

/**
 * One scope's numbers. The scope decides both what comes back and who may ask —
 * the server refuses a scope the caller's role has no business reading.
 */
export const getKpi = async <T>(scope: KpiScope, queryString?: string) =>
    httpClient.get<T>(`/kpi/${scope}`, { params: toParams(queryString) })

export const getKpiTargets = async (queryString?: string) =>
    httpClient.get<IKpiTarget[]>("/kpi-targets", { params: toParams(queryString) })

export const createKpiTarget = async (payload: Record<string, unknown>) =>
    httpClient.post<IKpiTarget>("/kpi-targets", payload)

export const updateKpiTarget = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IKpiTarget>(`/kpi-targets/${id}`, payload)

export const deleteKpiTarget = async (id: string) =>
    httpClient.delete<{ message: string }>(`/kpi-targets/${id}`)
