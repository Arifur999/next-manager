"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { toParams } from "@/lib/queryString"
import type { IInvoice, IPayment } from "@/types/billing.types"

export const getInvoices = async (queryString?: string) =>
    httpClient.get<IInvoice[]>("/invoices", { params: toParams(queryString) })

export const getInvoice = async (id: string) =>
    httpClient.get<IInvoice>(`/invoices/${id}`)

export const createInvoice = async (payload: Record<string, unknown>) =>
    httpClient.post<IInvoice>("/invoices", payload)

export const updateInvoice = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IInvoice>(`/invoices/${id}`, payload)

export const deleteInvoice = async (id: string) =>
    httpClient.delete<{ message: string }>(`/invoices/${id}`)

export const getPayments = async (queryString?: string) =>
    httpClient.get<IPayment[]>("/payments", { params: toParams(queryString) })

export const createPayment = async (payload: Record<string, unknown>) =>
    httpClient.post<IPayment>("/payments", payload)

export const updatePayment = async (id: string, payload: Record<string, unknown>) =>
    httpClient.patch<IPayment>(`/payments/${id}`, payload)

export const deletePayment = async (id: string) =>
    httpClient.delete<{ message: string }>(`/payments/${id}`)
