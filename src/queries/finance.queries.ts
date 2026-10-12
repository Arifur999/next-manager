// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getAccounts, getDistributions, getExchanges, getLoanSummary, getLoans, getRateSettings, getShareholders, getTransactions } from "@/services/finance.services"

export const accountsQuery = () =>
  queryOptions({ queryKey: queryKeys.accounts.list(), queryFn: () => getAccounts() })

export const distributionsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.distributions.list(queryString), queryFn: () => getDistributions(queryString) })

export const exchangesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.exchanges.list(queryString), queryFn: () => getExchanges(queryString) })

export const loanSummaryQuery = () =>
  queryOptions({ queryKey: queryKeys.loanSummary.list(), queryFn: () => getLoanSummary() })

export const loansListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.loans.list(queryString), queryFn: () => getLoans(queryString) })

export const rateSettingsQuery = () =>
  queryOptions({ queryKey: queryKeys.rateSettings.list(), queryFn: () => getRateSettings() })

export const shareholdersQuery = () =>
  queryOptions({ queryKey: queryKeys.shareholders.list(), queryFn: () => getShareholders() })

export const transactionsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.transactions.list(queryString), queryFn: () => getTransactions(queryString) })
