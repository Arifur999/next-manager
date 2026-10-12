// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import type { KpiScope } from "@/types/kpi.types"
import { getCashFlow, getClientRevenue, getDashboard, getKpi, getKpiTargets, getMonthlySeries, getProfitAndLoss, getProjectProfitability } from "@/services/insights.services"

export const cashFlowQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.reportCashFlow.list(queryString), queryFn: () => getCashFlow(queryString) })

export const clientRevenueQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.reportClientRevenue.list(queryString), queryFn: () => getClientRevenue(queryString) })

export const dashboardQuery = () =>
  queryOptions({ queryKey: queryKeys.dashboard.list(), queryFn: () => getDashboard() })

// T is the shape of the scope's payload; the key is scope plus query string.
export const kpiQuery = <T>(scope: KpiScope, queryString = "") =>
  queryOptions({
    queryKey: [...queryKeys.kpi.detail(scope), queryString] as const,
    queryFn: () => getKpi<T>(scope, queryString),
  })

export const kpiTargetsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.kpiTargets.list(queryString), queryFn: () => getKpiTargets(queryString) })

export const monthlySeriesQuery = (months = 12) =>
  queryOptions({ queryKey: queryKeys.reportMonthly.list(String(months)), queryFn: () => getMonthlySeries(months) })

export const profitAndLossListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.reportPl.list(queryString), queryFn: () => getProfitAndLoss(queryString) })

export const projectProfitabilityQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.reportProjectProfitability.list(queryString), queryFn: () => getProjectProfitability(queryString) })
