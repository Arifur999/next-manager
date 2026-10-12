"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    IAccount,
    IExchange,
    ILoan,
    ILoanSummary,
    IRateSettings,
    IShareholder,
    IShareholderDistribution,
    ITransaction,
} from "@/types/finance.types"

export const getAccounts = async () =>
    httpClient.get<IAccount[]>("/accounts")

export const createAccount = async (payload: Record<string, unknown>) =>
    httpClient.post<IAccount>("/accounts", payload)

export const updateAccount = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IAccount>(`/accounts/${id}`, payload)

export const deleteAccount = async (id: string) =>
    httpClient.delete<{ message: string }>(`/accounts/${id}`)

export const getExchanges = async (queryString?: string) =>
    httpClient.get<IExchange[]>("/exchanges", { params: toParams(queryString) })

export const createExchange = async (payload: Record<string, unknown>) =>
    httpClient.post<IExchange>("/exchanges", payload)

export const deleteExchange = async (id: string) =>
    httpClient.delete<{ message: string }>(`/exchanges/${id}`)

export const getTransactions = async (queryString?: string) =>
    httpClient.get<ITransaction[]>("/transactions", { params: toParams(queryString) })

export const getRateSettings = async () =>
    httpClient.get<IRateSettings>("/settings/exchange-rates")

export const setDefaultRate = async (rate: number | null) =>
    httpClient.patch("/settings/exchange-rates/default", { default_usd_rate: rate })

export const refreshRate = async () =>
    httpClient.post<{ rate: number; provider: string }>("/settings/exchange-rates/refresh", {})

export const getLoans = async (queryString?: string) =>
    httpClient.get<ILoan[]>("/loans", { params: toParams(queryString) })

export const getLoan = async (id: string) =>
    httpClient.get<ILoan>(`/loans/${id}`)

export const getLoanSummary = async () =>
    httpClient.get<ILoanSummary>("/loans/summary")

export const createLoan = async (payload: Record<string, unknown>) =>
    httpClient.post<ILoan>("/loans", payload)

export const updateLoan = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ILoan>(`/loans/${id}`, payload)

export const setLoanInstalments = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ILoan>(`/loans/${id}/instalments`, payload)

export const payLoanInstalment = async (instalmentId: string, payload: Record<string, unknown>) =>
    httpClient.patch<ILoan>(`/loans/instalments/${instalmentId}/pay`, payload)

export const reverseLoanInstalment = async (instalmentId: string) =>
    httpClient.patch<ILoan>(`/loans/instalments/${instalmentId}/reverse`, {})

export const deleteLoan = async (id: string) =>
    httpClient.delete<{ message: string }>(`/loans/${id}`)

export const getShareholders = async () =>
    httpClient.get<IShareholder[]>("/shareholders")

export const createShareholder = async (payload: Record<string, unknown>) =>
    httpClient.post<IShareholder>("/shareholders", payload)

export const updateShareholder = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IShareholder>(`/shareholders/${id}`, payload)

export const deleteShareholder = async (id: string) =>
    httpClient.delete<{ message: string }>(`/shareholders/${id}`)

export const getDistributions = async (queryString?: string) =>
    httpClient.get<IShareholderDistribution[]>("/shareholders/distributions", {
        params: toParams(queryString),
    })

export const createDistribution = async (payload: Record<string, unknown>) =>
    httpClient.post<IShareholderDistribution>("/shareholders/distributions", payload)

export const deleteDistribution = async (id: string) =>
    httpClient.delete<{ message: string }>(`/shareholders/distributions/${id}`)
