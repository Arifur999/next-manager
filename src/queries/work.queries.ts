// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getCapacities, getTaskReport, getTasks, getTimeEntries, getTimeSummary, getWorkflowStatuses, getWorkload } from "@/services/work.services"

export const capacitiesQuery = () =>
  queryOptions({ queryKey: queryKeys.capacities.list(), queryFn: () => getCapacities() })

export const taskReportQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.taskReport.list(queryString), queryFn: () => getTaskReport(queryString) })

export const tasksListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.tasks.list(queryString), queryFn: () => getTasks(queryString) })

export const timeEntriesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.timeEntries.list(queryString), queryFn: () => getTimeEntries(queryString) })

export const timeSummaryQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.timeSummary.list(queryString), queryFn: () => getTimeSummary(queryString) })

export const workflowStatusesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.workflowStatuses.list(queryString), queryFn: () => getWorkflowStatuses(queryString) })

export const workloadQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.workload.list(queryString), queryFn: () => getWorkload(queryString) })
