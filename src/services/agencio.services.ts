"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type {
    IAccount,
    IAssignmentRow,
    ICapacityRow,
    IClient,
    IClientFinancials,
    ICredential,
    ICredentialAccessEntry,
    IDashboard,
    IDuePerson,
    IDueTransaction,
    IExchange,
    IExpense,
    IExpenseCategory,
    IInvoice,
    ILeadPipeline,
    IMonthlyPoint,
    IOrganization,
    IOwnerWithdrawal,
    IPayment,
    IProfitAndLoss,
    IProject,
    IProjectFinancials,
    IProjectMember,
    IRateSettings,
    IRevealedCredential,
    ITask,
    ITeamPayout,
    ITimeEntry,
    ITimeSummary,
} from "@/types/agencio.types"

/**
 * Thin wrappers over httpClient, one per endpoint.
 *
 * Every one logs and re-throws — turning an error into a message the user
 * should see is the action layer's job, not this file's.
 */

// A query string from the URL, turned into the params object axios wants.
const toParams = (queryString?: string) =>
    queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined

const wrap = async <T>(label: string, run: () => Promise<T>): Promise<T> => {
    try {
        return await run()
    } catch (error) {
        console.log(`Error ${label}:`, error)
        throw error
    }
}

// ---------------------------------------------------------------- dashboard

export const getDashboard = async () =>
    wrap("fetching dashboard", () => httpClient.get<IDashboard>("/dashboard"))

// ------------------------------------------------------------------ clients

export const getClients = async (queryString?: string) =>
    wrap("fetching clients", () => httpClient.get<IClient[]>("/clients", { params: toParams(queryString) }))

export const getClient = async (id: string) =>
    wrap("fetching client", () => httpClient.get<IClient>(`/clients/${id}`))

export const getClientFinancials = async (id: string) =>
    wrap("fetching client financials", () => httpClient.get<IClientFinancials>(`/clients/${id}/financials`))

export const createClient = async (payload: Record<string, unknown>) =>
    wrap("creating client", () => httpClient.post<IClient>("/clients", payload))

export const updateClient = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating client", () => httpClient.patch<IClient>(`/clients/${id}`, payload))

export const deleteClient = async (id: string) =>
    wrap("deleting client", () => httpClient.delete<{ message: string }>(`/clients/${id}`))

// -------------------------------------------------------------------- leads

export const getLeadPipeline = async (queryString?: string) =>
    wrap("fetching leads", () => httpClient.get<ILeadPipeline>("/leads", { params: toParams(queryString) }))

export const createLead = async (payload: Record<string, unknown>) =>
    wrap("creating lead", () => httpClient.post("/leads", payload))

export const updateLead = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating lead", () => httpClient.patch(`/leads/${id}`, payload))

export const convertLead = async (id: string) =>
    wrap("converting lead", () => httpClient.post<IClient>(`/leads/${id}/convert`, {}))

export const deleteLead = async (id: string) =>
    wrap("deleting lead", () => httpClient.delete(`/leads/${id}`))

// ----------------------------------------------------------------- projects

export const getProjects = async (queryString?: string) =>
    wrap("fetching projects", () => httpClient.get<IProject[]>("/projects", { params: toParams(queryString) }))

export const getProject = async (id: string) =>
    wrap("fetching project", () => httpClient.get<IProject>(`/projects/${id}`))

export const getProjectFinancials = async (id: string) =>
    wrap("fetching project financials", () => httpClient.get<IProjectFinancials>(`/projects/${id}/financials`))

export const createProject = async (payload: Record<string, unknown>) =>
    wrap("creating project", () => httpClient.post<IProject>("/projects", payload))

export const updateProject = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating project", () => httpClient.patch<IProject>(`/projects/${id}`, payload))

export const deleteProject = async (id: string) =>
    wrap("deleting project", () => httpClient.delete(`/projects/${id}`))

// -------------------------------------------------------------------- tasks

export const getTasks = async (queryString?: string) =>
    wrap("fetching tasks", () => httpClient.get<ITask[]>("/tasks", { params: toParams(queryString) }))

export const createTask = async (payload: Record<string, unknown>) =>
    wrap("creating task", () => httpClient.post<ITask>("/tasks", payload))

export const updateTask = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating task", () => httpClient.patch<ITask>(`/tasks/${id}`, payload))

export const deleteTask = async (id: string) =>
    wrap("deleting task", () => httpClient.delete(`/tasks/${id}`))

// ----------------------------------------------------------------- accounts

export const getAccounts = async () =>
    wrap("fetching accounts", () => httpClient.get<IAccount[]>("/accounts"))

export const createAccount = async (payload: Record<string, unknown>) =>
    wrap("creating account", () => httpClient.post<IAccount>("/accounts", payload))

export const updateAccount = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating account", () => httpClient.patch<IAccount>(`/accounts/${id}`, payload))

export const deleteAccount = async (id: string) =>
    wrap("deleting account", () => httpClient.delete(`/accounts/${id}`))

// ----------------------------------------------------------------- invoices

export const getInvoices = async (queryString?: string) =>
    wrap("fetching invoices", () => httpClient.get<IInvoice[]>("/invoices", { params: toParams(queryString) }))

export const getInvoice = async (id: string) =>
    wrap("fetching invoice", () => httpClient.get<IInvoice>(`/invoices/${id}`))

export const createInvoice = async (payload: Record<string, unknown>) =>
    wrap("creating invoice", () => httpClient.post<IInvoice>("/invoices", payload))

export const updateInvoice = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating invoice", () => httpClient.patch<IInvoice>(`/invoices/${id}`, payload))

export const deleteInvoice = async (id: string) =>
    wrap("deleting invoice", () => httpClient.delete(`/invoices/${id}`))

// ----------------------------------------------------------------- payments

export const getPayments = async (queryString?: string) =>
    wrap("fetching payments", () => httpClient.get<IPayment[]>("/payments", { params: toParams(queryString) }))

export const createPayment = async (payload: Record<string, unknown>) =>
    wrap("recording payment", () => httpClient.post<IPayment>("/payments", payload))

export const updatePayment = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating payment", () => httpClient.patch<IPayment>(`/payments/${id}`, payload))

export const deletePayment = async (id: string) =>
    wrap("deleting payment", () => httpClient.delete(`/payments/${id}`))

// ---------------------------------------------------------------- exchanges

export const getExchanges = async (queryString?: string) =>
    wrap("fetching exchanges", () => httpClient.get<IExchange[]>("/exchanges", { params: toParams(queryString) }))

export const createExchange = async (payload: Record<string, unknown>) =>
    wrap("recording exchange", () => httpClient.post<IExchange>("/exchanges", payload))

export const deleteExchange = async (id: string) =>
    wrap("deleting exchange", () => httpClient.delete(`/exchanges/${id}`))

// ----------------------------------------------------------------- expenses

export const getExpenseCategories = async () =>
    wrap("fetching expense categories", () => httpClient.get<IExpenseCategory[]>("/expense-categories"))

export const createExpenseCategory = async (payload: Record<string, unknown>) =>
    wrap("creating expense category", () => httpClient.post<IExpenseCategory>("/expense-categories", payload))

export const updateExpenseCategory = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating expense category", () => httpClient.patch<IExpenseCategory>(`/expense-categories/${id}`, payload))

export const deleteExpenseCategory = async (id: string) =>
    wrap("deleting expense category", () => httpClient.delete(`/expense-categories/${id}`))

export const getExpenses = async (queryString?: string) =>
    wrap("fetching expenses", () => httpClient.get<IExpense[]>("/expenses", { params: toParams(queryString) }))

export const createExpense = async (payload: Record<string, unknown>) =>
    wrap("recording expense", () => httpClient.post<IExpense>("/expenses", payload))

export const updateExpense = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating expense", () => httpClient.patch<IExpense>(`/expenses/${id}`, payload))

export const deleteExpense = async (id: string) =>
    wrap("deleting expense", () => httpClient.delete(`/expenses/${id}`))

// ------------------------------------------------------- payouts, withdrawals

export const getTeamPayouts = async (queryString?: string) =>
    wrap("fetching payouts", () => httpClient.get<ITeamPayout[]>("/team-payouts", { params: toParams(queryString) }))

export const createTeamPayout = async (payload: Record<string, unknown>) =>
    wrap("recording payout", () => httpClient.post<ITeamPayout>("/team-payouts", payload))

export const deleteTeamPayout = async (id: string) =>
    wrap("deleting payout", () => httpClient.delete(`/team-payouts/${id}`))

export const getOwnerWithdrawals = async (queryString?: string) =>
    wrap("fetching withdrawals", () =>
        httpClient.get<IOwnerWithdrawal[]>("/owner-withdrawals", { params: toParams(queryString) })
    )

export const createOwnerWithdrawal = async (payload: Record<string, unknown>) =>
    wrap("recording withdrawal", () => httpClient.post<IOwnerWithdrawal>("/owner-withdrawals", payload))

export const deleteOwnerWithdrawal = async (id: string) =>
    wrap("deleting withdrawal", () => httpClient.delete(`/owner-withdrawals/${id}`))

// ------------------------------------------------------------- due payments

export const getDuePeople = async (queryString?: string) =>
    wrap("fetching due people", () => httpClient.get<IDuePerson[]>("/due-payments", { params: toParams(queryString) }))

export const createDuePerson = async (payload: Record<string, unknown>) =>
    wrap("creating due person", () => httpClient.post<IDuePerson>("/due-payments", payload))

export const getDueTransactions = async (queryString?: string) =>
    wrap("fetching due transactions", () =>
        httpClient.get<IDueTransaction[]>("/due-payments/transactions", { params: toParams(queryString) })
    )

export const createDueTransaction = async (payload: Record<string, unknown>) =>
    wrap("recording due transaction", () => httpClient.post<IDueTransaction>("/due-payments/transactions", payload))

export const deleteDueTransaction = async (id: string) =>
    wrap("deleting due transaction", () => httpClient.delete(`/due-payments/transactions/${id}`))

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
    wrap("deleting credential", () => httpClient.delete(`/vault/${id}`))

// ----------------------------------------------------------------- settings

export const getOrganization = async () =>
    wrap("fetching organization", () => httpClient.get<IOrganization>("/settings/organization"))

export const updateOrganization = async (payload: Record<string, unknown>) =>
    wrap("updating organization", () => httpClient.patch<IOrganization>("/settings/organization", payload))

export const getRateSettings = async () =>
    wrap("fetching rate settings", () => httpClient.get<IRateSettings>("/settings/exchange-rates"))

export const setDefaultRate = async (rate: number | null) =>
    wrap("setting default rate", () =>
        httpClient.patch("/settings/exchange-rates/default", { default_usd_rate: rate })
    )

export const refreshRate = async () =>
    wrap("refreshing rate", () =>
        httpClient.post<{ rate: number; provider: string }>("/settings/exchange-rates/refresh", {})
    )

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

// ------------------------------------------------------- project assignments

export const getProjectMembers = async (projectId: string) =>
    wrap("fetching project members", () =>
        httpClient.get<IProjectMember[]>(`/project-members/${projectId}`)
    )

export const getAssignmentOverview = async () =>
    wrap("fetching assignments", () => httpClient.get<IAssignmentRow[]>("/project-members/overview"))

export const assignProjectMember = async (payload: Record<string, unknown>) =>
    wrap("assigning to project", () => httpClient.post<IProjectMember>("/project-members", payload))

export const removeProjectMember = async (id: string) =>
    wrap("removing from project", () =>
        httpClient.delete<{ message: string }>(`/project-members/${id}`)
    )

// ------------------------------------------------------------- time tracking

export const getTimeEntries = async (queryString?: string) =>
    wrap("fetching time entries", () =>
        httpClient.get<ITimeEntry[]>("/time-entries", { params: toParams(queryString) })
    )

export const getTimeSummary = async (queryString?: string) =>
    wrap("fetching time summary", () =>
        httpClient.get<ITimeSummary>("/time-entries/summary", { params: toParams(queryString) })
    )

export const createTimeEntry = async (payload: Record<string, unknown>) =>
    wrap("logging time", () => httpClient.post<ITimeEntry>("/time-entries", payload))

export const updateTimeEntry = async (id: string, payload: Record<string, unknown>) =>
    wrap("updating time entry", () => httpClient.patch<ITimeEntry>(`/time-entries/${id}`, payload))

export const deleteTimeEntry = async (id: string) =>
    wrap("deleting time entry", () =>
        httpClient.delete<{ message: string }>(`/time-entries/${id}`)
    )

export const approveTimeEntry = async (id: string) =>
    wrap("approving time entry", () =>
        httpClient.post<ITimeEntry>(`/time-entries/${id}/approve`, {})
    )

export const unapproveTimeEntry = async (id: string) =>
    wrap("un-approving time entry", () =>
        httpClient.post<ITimeEntry>(`/time-entries/${id}/unapprove`, {})
    )

export const getCapacities = async () =>
    wrap("fetching capacities", () => httpClient.get<ICapacityRow[]>("/time-entries/capacity"))

export const setCapacity = async (userId: string, weeklyHours: number) =>
    wrap("setting capacity", () =>
        httpClient.patch(`/time-entries/capacity/${userId}`, { weekly_hours: weeklyHours })
    )
