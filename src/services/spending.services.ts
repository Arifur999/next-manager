"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type {
    IDuePerson,
    IDueTransaction,
    IExpense,
    IExpenseCategory,
    IOwnerWithdrawal,
    ITeamPayout,
} from "@/types/spending.types"

export const getExpenseCategories = async () =>
    httpClient.get<IExpenseCategory[]>("/expense-categories")

export const createExpenseCategory = async (payload: Record<string, unknown>) =>
    httpClient.post<IExpenseCategory>("/expense-categories", payload)

export const updateExpenseCategory = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IExpenseCategory>(`/expense-categories/${id}`, payload)

export const deleteExpenseCategory = async (id: string) =>
    httpClient.delete<{ message: string }>(`/expense-categories/${id}`)

export const getExpenses = async (queryString?: string) =>
    httpClient.get<IExpense[]>("/expenses", { params: toParams(queryString) })

export const createExpense = async (payload: Record<string, unknown>) =>
    httpClient.post<IExpense>("/expenses", payload)

export const updateExpense = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IExpense>(`/expenses/${id}`, payload)

export const deleteExpense = async (id: string) =>
    httpClient.delete<{ message: string }>(`/expenses/${id}`)

export const getTeamPayouts = async (queryString?: string) =>
    httpClient.get<ITeamPayout[]>("/team-payouts", { params: toParams(queryString) })

export const createTeamPayout = async (payload: Record<string, unknown>) =>
    httpClient.post<ITeamPayout>("/team-payouts", payload)

export const updateTeamPayout = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<ITeamPayout>(`/team-payouts/${id}`, payload)

export const deleteTeamPayout = async (id: string) =>
    httpClient.delete<{ message: string }>(`/team-payouts/${id}`)

export const getOwnerWithdrawals = async (queryString?: string) =>
    httpClient.get<IOwnerWithdrawal[]>("/owner-withdrawals", { params: toParams(queryString) })

export const createOwnerWithdrawal = async (payload: Record<string, unknown>) =>
    httpClient.post<IOwnerWithdrawal>("/owner-withdrawals", payload)

export const updateOwnerWithdrawal = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IOwnerWithdrawal>(`/owner-withdrawals/${id}`, payload)

export const deleteOwnerWithdrawal = async (id: string) =>
    httpClient.delete<{ message: string }>(`/owner-withdrawals/${id}`)

export const getDuePeople = async (queryString?: string) =>
    httpClient.get<IDuePerson[]>("/due-payments", { params: toParams(queryString) })

export const createDuePerson = async (payload: Record<string, unknown>) =>
    httpClient.post<IDuePerson>("/due-payments", payload)

export const updateDuePerson = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IDuePerson>(`/due-payments/${id}`, payload)

export const deleteDuePerson = async (id: string) =>
    httpClient.delete<{ message: string }>(`/due-payments/${id}`)

export const getDueTransactions = async (queryString?: string) =>
    httpClient.get<IDueTransaction[]>("/due-payments/transactions", { params: toParams(queryString) })

export const createDueTransaction = async (payload: Record<string, unknown>) =>
    httpClient.post<IDueTransaction>("/due-payments/transactions", payload)

export const deleteDueTransaction = async (id: string) =>
    httpClient.delete<{ message: string }>(`/due-payments/transactions/${id}`)
