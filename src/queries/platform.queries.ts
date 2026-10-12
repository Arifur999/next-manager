// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getAgencyInvites, getAnnouncements, getCompanies, getMySubscription, getPlans, getPlatformActivity, getPlatformAdmins, getPlatformExpenses, getPlatformFinance, getPlatformInvites, getPlatformOverview, getPlatformSettings, getPlatformTrend } from "@/services/platform.services"

export const agencyInvitesQuery = () =>
  queryOptions({ queryKey: queryKeys.agencyInvites.list(), queryFn: () => getAgencyInvites() })

export const announcementsQuery = () =>
  queryOptions({ queryKey: queryKeys.platformAnnouncements.list(), queryFn: () => getAnnouncements() })

export const companiesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.platformCompanies.list(queryString), queryFn: () => getCompanies(queryString) })

export const mySubscriptionQuery = () =>
  queryOptions({ queryKey: queryKeys.mySubscription.list(), queryFn: () => getMySubscription() })

export const plansQuery = () =>
  queryOptions({ queryKey: queryKeys.platformPlans.list(), queryFn: () => getPlans() })

export const platformActivityQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.platformActivity.list(queryString), queryFn: () => getPlatformActivity(queryString) })

export const platformAdminsQuery = () =>
  queryOptions({ queryKey: queryKeys.platformAdmins.list(), queryFn: () => getPlatformAdmins() })

export const platformExpensesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.platformExpenses.list(queryString), queryFn: () => getPlatformExpenses(queryString) })

export const platformFinanceQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.platformFinance.list(queryString), queryFn: () => getPlatformFinance(queryString) })

export const platformInvitesQuery = () =>
  queryOptions({ queryKey: queryKeys.platformInvites.list(), queryFn: () => getPlatformInvites() })

export const platformOverviewQuery = () =>
  queryOptions({ queryKey: queryKeys.platformOverview.list(), queryFn: () => getPlatformOverview() })

export const platformSettingsQuery = () =>
  queryOptions({ queryKey: queryKeys.platformSettings.list(), queryFn: () => getPlatformSettings() })

export const platformTrendQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.platformTrend.list(queryString), queryFn: () => getPlatformTrend(queryString) })
