// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getInvoice, getInvoices, getPayments } from "@/services/billing.services"

export const invoiceDetailQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.invoices.detail(id), queryFn: () => getInvoice(id) })

export const invoicesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.invoices.list(queryString), queryFn: () => getInvoices(queryString) })

export const paymentsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.payments.list(queryString), queryFn: () => getPayments(queryString) })
