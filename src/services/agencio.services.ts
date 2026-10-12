"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { IDashboard, IKpiTarget, IMonthlyPoint, IProfitAndLoss } from "@/types/agencio.types"
import type { KpiScope } from "@/types/kpi.types"
import type {
    IAgencyInvite,
    IAnnouncement,
    ICompanyRow,
    IMySubscription,
    IPlatformActivity,
    IPlatformExpense,
    IPlatformFinance,
    IPlatformTrend,
    IPlatformAdmin,
    IPlatformInvite,
    IPlatformOverview,
    IPlatformSettings,
    IPlan,
    IPublishResult,
    ISubscription,
} from "@/types/platform.types"

/**
 * Thin wrappers over httpClient, one per endpoint.
 *
 * Errors propagate untouched: httpClient logs them and the action layer turns
 * them into a message the user should see.
 */

// httpClient already logs failures; the label only names the call for readers.
const wrap = async <T>(label: string, run: () => Promise<T>): Promise<T> => run()

// ---------------------------------------------------------------- dashboard

export const getDashboard = async () =>
    wrap("fetching dashboard", () => httpClient.get<IDashboard>("/dashboard"))

// ------------------------------------------------------------------ reports

export const getProfitAndLoss = async (queryString?: string) =>
    wrap("fetching P&L", () => httpClient.get<IProfitAndLoss>("/reports/profit-loss", { params: toParams(queryString) }))

export const getMonthlySeries = async (months = 12) =>
    wrap("fetching monthly series", () =>
        httpClient.get<IMonthlyPoint[]>("/reports/monthly", { params: { months } })
    )

export const getClientRevenue = async (queryString?: string) =>
    wrap("fetching client revenue", () =>
        httpClient.get("/reports/client-revenue", { params: toParams(queryString) })
    )

export const getProjectProfitability = async (queryString?: string) =>
    wrap("fetching project profitability", () =>
        httpClient.get("/reports/project-profitability", { params: toParams(queryString) })
    )

export const getCashFlow = async (queryString?: string) =>
    wrap("fetching cash flow", () => httpClient.get("/reports/cash-flow", { params: toParams(queryString) }))

// ---------------------------------------------------------------------------
// Milestones

// ---------------------------------------------------------------------------
// KPI targets
// ---------------------------------------------------------------------------

export const getKpiTargets = async (queryString?: string) =>
    wrap("fetching targets", () =>
        httpClient.get<IKpiTarget[]>("/kpi-targets", { params: toParams(queryString) })
    )

export const createKpiTarget = async (payload: Record<string, unknown>) =>
    wrap("setting a target", () => httpClient.post<IKpiTarget>("/kpi-targets", payload))

export const updateKpiTarget = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating a target", () => httpClient.patch<IKpiTarget>(`/kpi-targets/${id}`, payload))

export const deleteKpiTarget = async (id: string) =>
    wrap("deleting a target", () => httpClient.delete<{ message: string }>(`/kpi-targets/${id}`))

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

/**
 * One scope's numbers. The scope decides both what comes back and who may ask —
 * the server refuses a scope the caller's role has no business reading.
 */
export const getKpi = async <T>(scope: KpiScope, queryString?: string) =>
    wrap(`fetching ${scope} KPIs`, () =>
        httpClient.get<T>(`/kpi/${scope}`, { params: toParams(queryString) })
    )

// ---------------------------------------------------------------------------
// Platform (super_admin) and a company's own standing
// ---------------------------------------------------------------------------

export const getMySubscription = async () =>
    wrap("fetching subscription", () =>
        httpClient.get<IMySubscription>("/platform/subscription")
    )

export const getPlans = async () =>
    wrap("fetching plans", () => httpClient.get<IPlan[]>("/platform/plans"))

export const createPlan = async (payload: Record<string, unknown>) =>
    wrap("creating a plan", () => httpClient.post<IPlan>("/platform/plans", payload))

export const updatePlan = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating a plan", () => httpClient.patch<IPlan>(`/platform/plans/${id}`, payload))

export const getCompanies = async (queryString?: string) =>
    wrap("fetching companies", () =>
        httpClient.get<ICompanyRow[]>("/platform/companies", { params: toParams(queryString) })
    )

export const setSubscription = async (organizationId: string, payload: Record<string, unknown>) =>
    wrap("updating a subscription", () =>
        httpClient.patch<ISubscription>(
            `/platform/companies/${organizationId}/subscription`,
            payload
        )
    )

// ---------------------------------------------------------------------------
// Activity (audit trail). Read-only by design — there is no write here because
// there is no write endpoint.
// ---------------------------------------------------------------------------

export const getPlatformOverview = async () =>
    wrap("fetching platform overview", () =>
        httpClient.get<IPlatformOverview>("/platform/overview")
    )

export const createCompany = async (payload: Record<string, unknown>) =>
    wrap("creating a company", () => httpClient.post("/platform/companies", payload))

// ---------------------------------------------------------------------------
// Team invites and the pending queue

// ---------------------------------------------------------------------------
// Lead sources (where the work is landed) and client links

// ---------------------------------------------------------------------------
// The platform team
// ---------------------------------------------------------------------------

export const getPlatformAdmins = async () =>
    wrap("fetching platform admins", () =>
        httpClient.get<IPlatformAdmin[]>("/platform/admins")
    )

export const setAdminPermissions = async (id: string, permissions: string[]) =>
    wrap("updating access", () =>
        httpClient.patch<IPlatformAdmin>(`/platform/admins/${id}/permissions`, { permissions })
    )

export const approvePlatformAdmin = async (id: string) =>
    wrap("approving an operator", () => httpClient.post(`/platform/admins/${id}/approve`, {}))

export const removePlatformAdmin = async (id: string) =>
    wrap("removing an operator", () =>
        httpClient.delete<{ message: string }>(`/platform/admins/${id}`)
    )

/** Returns `join_url` — the only time the token is readable. */
export const createPlatformInvite = async (payload: Record<string, unknown>) =>
    wrap("inviting an operator", () =>
        httpClient.post<{
            invite: IPlatformInvite
            join_url: string
            email: { delivered: boolean; reason: string | null }
        }>("/platform/invites", payload)
    )

export const getPlatformInvites = async () =>
    wrap("fetching platform invites", () =>
        httpClient.get<IPlatformInvite[]>("/platform/invites")
    )

export const revokePlatformInvite = async (id: string) =>
    wrap("revoking an invite", () =>
        httpClient.delete<{ message: string }>(`/platform/invites/${id}`)
    )

export const getPlatformActivity = async (queryString?: string) =>
    wrap("fetching platform activity", () =>
        httpClient.get<IPlatformActivity[]>("/platform/activity", { params: toParams(queryString) })
    )

// ---------------------------------------------------------------------------
// The platform's own books
// ---------------------------------------------------------------------------

export const getPlatformFinance = async (queryString?: string) =>
    wrap("fetching the financial report", () =>
        httpClient.get<IPlatformFinance>("/platform/finance", { params: toParams(queryString) })
    )

export const getPlatformTrend = async (queryString?: string) =>
    wrap("fetching the trend", () =>
        httpClient.get<IPlatformTrend>("/platform/trend", { params: toParams(queryString) })
    )

export const getPlatformExpenses = async (queryString?: string) =>
    wrap("fetching platform expenses", () =>
        httpClient.get<IPlatformExpense[]>("/platform/expenses", { params: toParams(queryString) })
    )

export const createPlatformExpense = async (payload: Record<string, unknown>) =>
    wrap("recording an expense", () =>
        httpClient.post<IPlatformExpense>("/platform/expenses", payload)
    )

export const deletePlatformExpense = async (id: string) =>
    wrap("removing an expense", () =>
        httpClient.delete<{ message: string }>(`/platform/expenses/${id}`)
    )

// ---------------------------------------------------------------------------
// Announcements: the console writes them, the bell reads them
// ---------------------------------------------------------------------------

export const getAnnouncements = async () =>
    wrap("fetching announcements", () => httpClient.get<IAnnouncement[]>("/platform/announcements"))

export const createAnnouncement = async (payload: Record<string, unknown>) =>
    wrap("saving the draft", () =>
        httpClient.post<IAnnouncement>("/platform/announcements", payload)
    )

export const updateAnnouncement = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating the draft", () =>
        httpClient.patch<IAnnouncement>(`/platform/announcements/${id}`, payload)
    )

export const publishAnnouncement = async (id: string) =>
    wrap("publishing", () =>
        httpClient.post<IPublishResult>(`/platform/announcements/${id}/publish`, {})
    )

export const deleteAnnouncement = async (id: string) =>
    wrap("removing the announcement", () =>
        httpClient.delete<{ id: string }>(`/platform/announcements/${id}`)
    )

// ---------------------------------------------------------------------------
// How this installation is set up
// ---------------------------------------------------------------------------

export const getPlatformSettings = async () =>
    wrap("fetching the settings", () =>
        httpClient.get<IPlatformSettings>("/platform/settings")
    )

export const updatePlatformSettings = async (payload: Record<string, unknown>) =>
    wrap("saving the settings", () =>
        httpClient.patch<IPlatformSettings>("/platform/settings", payload)
    )

// ---------------------------------------------------------------------------
// Bringing an agency on — the console's actual job
// ---------------------------------------------------------------------------

export const getAgencyInvites = async () =>
    wrap("fetching agency invites", () =>
        httpClient.get<IAgencyInvite[]>("/platform/agency-invites")
    )

export const createAgencyInvite = async (payload: Record<string, unknown>) =>
    wrap("inviting the agency", () =>
        httpClient.post<{
            invite: IAgencyInvite
            join_url: string
            email: { delivered: boolean; reason: string | null }
        }>("/platform/agency-invites", payload)
    )

export const revokeAgencyInvite = async (id: string) =>
    wrap("revoking the invite", () =>
        httpClient.delete<{ message: string }>(`/platform/agency-invites/${id}`)
    )

// ---------------------------------------------------------------------------
// Departments — which part of the business somebody is in

// ---------------------------------------------------------------------------
// The ledger, read as a ledger

// ---------------------------------------------------------------------------
// What the company notifies itself about

// ---------------------------------------------------------------------------
// Who tried to sign in

// ---------------------------------------------------------------------------
// The columns on an agency's boards

// ---------------------------------------------------------------------------
// What the agency sells

// ---------------------------------------------------------------------------
// People: attendance, leave and payroll
