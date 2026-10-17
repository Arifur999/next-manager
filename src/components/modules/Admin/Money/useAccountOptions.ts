"use client"

import { accountsQuery } from "@/queries/finance.queries"
import type { Currency } from "@/types/common.types"
import { useQuery } from "@tanstack/react-query"
import { pickAccountOptions } from "./accountOptions"

// A refused read (a role without the accounts permission) reaches the browser
// without its status, so it cannot be told from an outage: one message covers both.
export const ACCOUNTS_UNAVAILABLE = "Accounts did not load. If this keeps happening, ask an admin for access to accounts."

const emptyMessageFor = (query: { isError: boolean; isPending: boolean }, currency: Currency) => {
  if (query.isError) return ACCOUNTS_UNAVAILABLE
  if (query.isPending) return "Loading accounts..."
  return `Add a ${currency} account first`
}

export const useAccountOptions = (currency: Currency, currentId?: string) => {
  // One retry: a refusal will not change on the third attempt, and the picker waits for it.
  const query = useQuery({ ...accountsQuery(), retry: 1 })

  return {
    options: pickAccountOptions(query.data?.data ?? [], currency, currentId),
    emptyMessage: emptyMessageFor(query, currency),
  }
}
