"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    IActivityEntry,
    IActivityFilters,
    IAttendance,
    ICredential,
    ICredentialAccessEntry,
    IDashboard,
    IDepartment,
    IKpiTarget,
    ILeaveBalance,
    ILeaveRequest,
    IConversation,
    ILeaveType,
    ILoginEvent,
    IMonthlyPoint,
    INotificationRule,
    IOrganization,
    IMessage,
    IPayrollRun,
    IServiceDetail,
    IProfitAndLoss,
    IRevealedCredential,
    IService,
    IServiceCategory,
    IServiceRevenue,
    IServiceTemplate,
    ITeamInvite,
} from "@/types/agencio.types"
import type { KpiScope } from "@/types/kpi.types"
import type {
    IAgencyInvite,
    IAnnouncement,
    ICompanyRow,
    IMySubscription,
    INotification,
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

// -------------------------------------------------------------------- vault

export const getCredentials = async (queryString?: string) =>
    wrap("fetching credentials", () => httpClient.get<ICredential[]>("/vault", { params: toParams(queryString) }))

export const createCredential = async (payload: Record<string, unknown>) =>
    wrap("creating credential", () => httpClient.post<ICredential>("/vault", payload))

export const updateCredential = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating credential", () => httpClient.patch<ICredential>(`/vault/${id}`, payload))

/** The only call that returns a real password — and the server logs every one. */
export const revealCredential = async (id: string) =>
    wrap("revealing credential", () => httpClient.get<IRevealedCredential>(`/vault/${id}/reveal`))

export const getCredentialAccessLog = async (id: string) =>
    wrap("fetching access log", () => httpClient.get<ICredentialAccessEntry[]>(`/vault/${id}/access-log`))

export const deleteCredential = async (id: string) =>
    wrap("deleting credential", () => httpClient.delete<{ message: string }>(`/vault/${id}`))

// ----------------------------------------------------------------- settings

export const getOrganization = async () =>
    wrap("fetching organization", () => httpClient.get<IOrganization>("/settings/organization"))

export const updateOrganization = async (payload: Record<string, unknown>) =>
    wrap("updating organization", () => httpClient.patch<IOrganization>("/settings/organization", payload))

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

export const getActivity = async (queryString?: string) =>
    wrap("fetching activity", () =>
        httpClient.get<IActivityEntry[]>("/activity", { params: toParams(queryString) })
    )

export const getActivityFilters = async () =>
    wrap("fetching activity filters", () =>
        httpClient.get<IActivityFilters>("/activity/filters")
    )

export const getPlatformOverview = async () =>
    wrap("fetching platform overview", () =>
        httpClient.get<IPlatformOverview>("/platform/overview")
    )

export const createCompany = async (payload: Record<string, unknown>) =>
    wrap("creating a company", () => httpClient.post("/platform/companies", payload))

// ---------------------------------------------------------------------------
// Team invites and the pending queue
// ---------------------------------------------------------------------------

/** Returns `join_url` — the only time the token is ever readable. */
export const createInvite = async (payload: Record<string, unknown>) =>
    wrap("creating an invite", () =>
        httpClient.post<{ invite: ITeamInvite; join_url: string }>("/team-invites", payload)
    )

export const getInvites = async () =>
    wrap("fetching invites", () => httpClient.get<ITeamInvite[]>("/team-invites"))

export const revokeInvite = async (id: string) =>
    wrap("revoking an invite", () =>
        httpClient.delete<{ message: string }>(`/team-invites/${id}`)
    )

export const approveMember = async (id: string) =>
    wrap("approving a member", () =>
        httpClient.post(`/team-invites/members/${id}/approve`, {})
    )

export const rejectMember = async (id: string, payload: Record<string, unknown>) =>
    wrap("turning down a request", () =>
        httpClient.post(`/team-invites/members/${id}/reject`, payload)
    )

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

export const getNotifications = async () =>
    wrap("fetching notifications", () => httpClient.get<INotification[]>("/notifications"))

export const getUnreadCount = async () =>
    wrap("fetching the unread count", () =>
        httpClient.get<{ unread: number }>("/notifications/unread-count")
    )

export const markNotificationRead = async (id: string) =>
    wrap("marking it read", () => httpClient.post<{ id: string }>(`/notifications/${id}/read`, {}))

export const markAllNotificationsRead = async () =>
    wrap("marking everything read", () =>
        httpClient.post<{ marked: number }>("/notifications/read-all", {})
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

export const getDepartments = async () =>
    wrap("fetching departments", () => httpClient.get<IDepartment[]>("/departments"))

export const createDepartment = async (payload: Record<string, unknown>) =>
    wrap("creating the department", () =>
        httpClient.post<IDepartment>("/departments", payload)
    )

export const updateDepartment = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating the department", () =>
        httpClient.patch<IDepartment>(`/departments/${id}`, payload)
    )

export const deleteDepartment = async (id: string) =>
    wrap("deleting the department", () =>
        httpClient.delete<{ message: string }>(`/departments/${id}`)
    )

// ---------------------------------------------------------------------------
// The ledger, read as a ledger

// ---------------------------------------------------------------------------
// What the company notifies itself about
// ---------------------------------------------------------------------------

export const getNotificationRules = async () =>
    wrap("fetching notification settings", () =>
        httpClient.get<INotificationRule[]>("/notification-rules")
    )

export const setNotificationRule = async (event: string, payload: Record<string, unknown>) =>
    wrap("saving the notification setting", () =>
        httpClient.patch<INotificationRule>(`/notification-rules/${event}`, payload)
    )

// ---------------------------------------------------------------------------
// Who tried to sign in
// ---------------------------------------------------------------------------

export const getLoginEvents = async (queryString?: string) =>
    wrap("fetching the login history", () =>
        httpClient.get<ILoginEvent[]>("/security/login-events", { params: toParams(queryString) })
    )

// ---------------------------------------------------------------------------
// The columns on an agency's boards

// ---------------------------------------------------------------------------
// What the agency sells
// ---------------------------------------------------------------------------

export const getServices = async (queryString?: string) =>
    wrap("fetching services", () =>
        httpClient.get<IService[]>("/services", { params: toParams(queryString) })
    )

export const createService = async (payload: Record<string, unknown>) =>
    wrap("adding the service", () => httpClient.post<IService>("/services", payload))

export const updateService = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating the service", () => httpClient.patch<IService>(`/services/${id}`, payload))

export const deleteService = async (id: string) =>
    wrap("removing the service", () =>
        httpClient.delete<{ message: string }>(`/services/${id}`)
    )

export const getServiceRevenue = async () =>
    wrap("fetching what each service earned", () =>
        httpClient.get<IServiceRevenue[]>("/services/revenue")
    )

export const getServiceCategories = async () =>
    wrap("fetching service categories", () =>
        httpClient.get<IServiceCategory[]>("/services/categories")
    )

export const createServiceCategory = async (payload: Record<string, unknown>) =>
    wrap("adding the category", () =>
        httpClient.post<IServiceCategory>("/services/categories", payload)
    )

export const updateServiceCategory = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating the category", () =>
        httpClient.patch<IServiceCategory>(`/services/categories/${id}`, payload)
    )

export const deleteServiceCategory = async (id: string) =>
    wrap("removing the category", () =>
        httpClient.delete<{ message: string }>(`/services/categories/${id}`)
    )

export const getServiceTemplates = async () =>
    wrap("fetching packages", () => httpClient.get<IServiceTemplate[]>("/services/templates"))

export const createServiceTemplate = async (payload: Record<string, unknown>) =>
    wrap("creating the package", () =>
        httpClient.post<IServiceTemplate>("/services/templates", payload)
    )

export const deleteServiceTemplate = async (id: string) =>
    wrap("removing the package", () =>
        httpClient.delete<{ message: string }>(`/services/templates/${id}`)
    )

// ---------------------------------------------------------------------------
// People: attendance, leave and payroll
// ---------------------------------------------------------------------------

export const getAttendance = async (queryString?: string) =>
    wrap("fetching attendance", () =>
        httpClient.get<IAttendance[]>("/hr/attendance", { params: toParams(queryString) })
    )

export const clockAttendance = async () =>
    wrap("clocking in", () => httpClient.post<IAttendance>("/hr/attendance/clock", {}))

export const recordAttendance = async (payload: Record<string, unknown>) =>
    wrap("recording attendance", () => httpClient.post<IAttendance>("/hr/attendance", payload))

export const getLeaveTypes = async () =>
    wrap("fetching leave types", () => httpClient.get<ILeaveType[]>("/hr/leave-types"))

export const createLeaveType = async (payload: Record<string, unknown>) =>
    wrap("adding the leave type", () => httpClient.post<ILeaveType>("/hr/leave-types", payload))

// Retiring a kind is `is_active: false`, never a delete: leave already
// approved against it has to keep saying what it was for.
export const updateLeaveType = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating the leave type", () =>
        httpClient.patch<ILeaveType>(`/hr/leave-types/${id}`, payload)
    )

export const getLeaveRequests = async (queryString?: string) =>
    wrap("fetching leave requests", () =>
        httpClient.get<ILeaveRequest[]>("/hr/leave", { params: toParams(queryString) })
    )

export const getLeaveBalance = async (queryString?: string) =>
    wrap("fetching the leave balance", () =>
        httpClient.get<ILeaveBalance[]>("/hr/leave/balance", { params: toParams(queryString) })
    )

export const requestLeave = async (payload: Record<string, unknown>) =>
    wrap("asking for leave", () => httpClient.post<ILeaveRequest>("/hr/leave", payload))

export const cancelLeave = async (id: string) =>
    wrap("withdrawing the request", () =>
        httpClient.post<ILeaveRequest>(`/hr/leave/${id}/cancel`, {})
    )

export const decideLeave = async (id: string, payload: Record<string, unknown>) =>
    wrap("deciding the request", () =>
        httpClient.post<ILeaveRequest>(`/hr/leave/${id}/decide`, payload)
    )

export const getPayrollRuns = async () =>
    wrap("fetching payroll", () => httpClient.get<IPayrollRun[]>("/hr/payroll"))

export const createPayrollRun = async (payload: Record<string, unknown>) =>
    wrap("opening payroll", () => httpClient.post<IPayrollRun>("/hr/payroll", payload))

export const setPayrollItems = async (id: string, payload: Record<string, unknown>) =>
    wrap("saving payroll", () => httpClient.patch<IPayrollRun>(`/hr/payroll/${id}/items`, payload))

export const completePayroll = async (id: string, payload: Record<string, unknown>) =>
    wrap("paying the salaries", () =>
        httpClient.post<IPayrollRun>(`/hr/payroll/${id}/complete`, payload)
    )

export const deletePayrollRun = async (id: string) =>
    wrap("discarding the draft", () =>
        httpClient.delete<{ message: string }>(`/hr/payroll/${id}`)
    )

// ---------------------------------------------------------------- chat

export const getConversations = async (queryString?: string) =>
    wrap("fetching conversations", () =>
        httpClient.get<IConversation[]>("/chat", { params: toParams(queryString) })
    )

export const getUnreadTotal = async () =>
    wrap("fetching the unread count", () =>
        httpClient.get<{ unread_count: number }>("/chat/unread")
    )

export const createConversation = async (payload: Record<string, unknown>) =>
    wrap("starting the conversation", () =>
        httpClient.post<{ id: string }>("/chat", payload)
    )

export const getMessages = async (id: string) =>
    wrap("fetching messages", () => httpClient.get<IMessage[]>(`/chat/${id}/messages`))

export const sendMessage = async (id: string, payload: Record<string, unknown>) =>
    wrap("sending the message", () =>
        httpClient.post<IMessage>(`/chat/${id}/messages`, payload)
    )

export const markConversationRead = async (id: string) =>
    wrap("marking it read", () => httpClient.post<{ message: string }>(`/chat/${id}/read`, {}))

export const addConversationMembers = async (id: string, payload: Record<string, unknown>) =>
    wrap("adding them", () => httpClient.post<{ message: string }>(`/chat/${id}/members`, payload))

export const setConversationArchived = async (id: string, archived: boolean) =>
    wrap("archiving it", () =>
        httpClient.post<{ message: string }>(`/chat/${id}/archive`, { archived })
    )

export const leaveConversation = async (id: string) =>
    wrap("leaving it", () => httpClient.post<{ message: string }>(`/chat/${id}/leave`, {}))

export const getService = async (id: string) =>
    wrap("fetching the service", () => httpClient.get<IServiceDetail>(`/services/${id}`))
