"use client"

import CreateAccountModal from "@/components/modules/Admin/Accounts/CreateAccountModal"
import StatTile from "@/components/shared/StatTile"
import ErrorState from "@/components/shared/state/ErrorState"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatMoney, formatUsd } from "@/lib/currency"
import type { IAccount } from "@/types/finance.types"
import type { Currency } from "@/types/common.types"
import { useQuery } from "@tanstack/react-query"
import { Banknote, Wallet } from "lucide-react"
import { accountsQuery } from "@/queries/finance.queries"

const sumBalances = (accounts: IAccount[]) => accounts.reduce((running, account) => running + account.balance, 0)

// At module scope: a component declared during render remounts, losing its
// state, every time the board re-renders.
const CurrencyColumn = ({
  title,
  accounts,
  currency,
}: {
  title: string
  accounts: IAccount[]
  currency: Currency
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
      <CardTitle className="text-base">{title}</CardTitle>
      <span className="text-sm font-medium tabular-nums">
        {formatMoney(sumBalances(accounts), currency)}
      </span>
    </CardHeader>

    {accounts.length === 0 ? (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        No {currency} accounts yet.
      </p>
    ) : (
      <ul className="divide-y">
        {accounts.map((account) => (
          <li key={account.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{account.name}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {account.type.replace(/_/g, " ")}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {!account.is_active && (
                <Badge variant="outline" className="text-xs">
                  Inactive
                </Badge>
              )}
              <span className="text-sm font-medium tabular-nums">
                {formatMoney(account.balance, currency)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

// Accounts grouped by currency, because a flat list with one total would add
// USD to BDT, which this app never does.
const AccountsBoard = () => {
  const { data, isLoading, isError, isFetching, refetch } = useQuery(accountsQuery())

  const accounts = data?.data ?? []
  const usdAccounts = accounts.filter((account) => account.currency === "USD")
  const bdtAccounts = accounts.filter((account) => account.currency === "BDT")

  // Two empty columns and a zero balance would read as "no money".
  if (isError) {
    return (
      <Card>
        <ErrorState
          message="Accounts did not load."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </Card>
    )
  }

  if (isLoading && accounts.length === 0) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-64 animate-pulse bg-muted/40" />
        <Card className="h-64 animate-pulse bg-muted/40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="Held in USD"
            value={formatUsd(sumBalances(usdAccounts))}
            hint={`${usdAccounts.length} account${usdAccounts.length === 1 ? "" : "s"}`}
            icon={<Wallet className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Held in BDT"
            value={formatBdt(sumBalances(bdtAccounts))}
            hint={`${bdtAccounts.length} account${bdtAccounts.length === 1 ? "" : "s"}`}
            icon={<Banknote className="size-5" />}
            tone={3}
          />
        </div>

        <CreateAccountModal />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CurrencyColumn title="USD wallets" accounts={usdAccounts} currency="USD" />
        <CurrencyColumn title="BDT wallets" accounts={bdtAccounts} currency="BDT" />
      </div>

      <p className="text-xs text-muted-foreground">
        Balances are computed from every recorded movement, not stored — so they always add up to
        the ledger behind them. USD and BDT are held separately and never combined into one total.
      </p>
    </div>
  )
}

export default AccountsBoard
