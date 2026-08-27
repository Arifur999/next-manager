"use client"

import CreateAccountModal from "@/components/modules/Admin/Accounts/CreateAccountModal"
import StatTile from "@/components/shared/StatTile"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt, formatMoney, formatUsd } from "@/lib/currency"
import { getAccounts } from "@/services/agencio.services"
import type { Currency, IAccount } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { Banknote, Wallet } from "lucide-react"

const sumBalances = (rows: IAccount[]) => rows.reduce((running, row) => running + row.balance, 0)

// Declared at module scope, not inside the board: a component created during
// render is remounted every time the parent re-renders, losing any state inside
// it — and React Compiler flags the pattern for exactly that reason.
const CurrencyColumn = ({
  title,
  rows,
  currency,
}: {
  title: string
  rows: IAccount[]
  currency: Currency
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
      <CardTitle className="text-base">{title}</CardTitle>
      <span className="text-sm font-medium tabular-nums">
        {formatMoney(sumBalances(rows), currency)}
      </span>
    </CardHeader>

    {rows.length === 0 ? (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        No {currency} accounts yet.
      </p>
    ) : (
      <ul className="divide-y">
        {rows.map((account) => (
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

/**
 * Accounts, grouped by currency.
 *
 * Grouped rather than listed flat because the two currencies are genuinely
 * separate pots — a single list with a mixed total would invite exactly the
 * addition this app refuses to do anywhere else.
 */
const AccountsBoard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
  })

  const accounts = (data?.data ?? []) as IAccount[]
  const usd = accounts.filter((account) => account.currency === "USD")
  const bdt = accounts.filter((account) => account.currency === "BDT")

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
            value={formatUsd(sumBalances(usd))}
            hint={`${usd.length} account${usd.length === 1 ? "" : "s"}`}
            icon={<Wallet className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Held in BDT"
            value={formatBdt(sumBalances(bdt))}
            hint={`${bdt.length} account${bdt.length === 1 ? "" : "s"}`}
            icon={<Banknote className="size-5" />}
            tone={3}
          />
        </div>

        <CreateAccountModal />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CurrencyColumn title="USD wallets" rows={usd} currency="USD" />
        <CurrencyColumn title="BDT wallets" rows={bdt} currency="BDT" />
      </div>

      <p className="text-xs text-muted-foreground">
        Balances are computed from every recorded movement, not stored — so they always add up to
        the ledger behind them. USD and BDT are held separately and never combined into one total.
      </p>
    </div>
  )
}

export default AccountsBoard
