// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getDuePeople, getDueTransactions, getExpenseCategories, getExpenses, getOwnerWithdrawals, getTeamPayouts } from "@/services/spending.services"

export const duePeopleQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.duePeople.list(queryString), queryFn: () => getDuePeople(queryString) })

export const dueTransactionsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.dueTransactions.list(queryString), queryFn: () => getDueTransactions(queryString) })

export const expenseCategoriesQuery = () =>
  queryOptions({ queryKey: queryKeys.expenseCategories.list(), queryFn: () => getExpenseCategories() })

export const expensesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.expenses.list(queryString), queryFn: () => getExpenses(queryString) })

export const ownerWithdrawalsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.withdrawals.list(queryString), queryFn: () => getOwnerWithdrawals(queryString) })

export const teamPayoutsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.payouts.list(queryString), queryFn: () => getTeamPayouts(queryString) })
