"use client"

import AddPersonModal from "@/components/modules/Admin/DuePayments/AddPersonModal"
import RecordTransactionModal from "@/components/modules/Admin/DuePayments/RecordTransactionModal"
import StatTile from "@/components/shared/StatTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { getDuePeople, getDueTransactions } from "@/services/agencio.services"
import type { IDuePerson, IDueTransaction } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react"

/**
 * Informal lending, in and out.
 *
 * The sign convention is the thing to get right on screen: a POSITIVE balance
 * means the agency has taken more from that person than it has given back, so
 * the agency owes THEM. Showing a bare signed number would leave every reader
 * working that out from scratch, so each row says which way it points.
 */

const DuePaymentsBoard = () => {
  const { data: peopleData, isLoading } = useQuery({
    queryKey: ["due-people"],
    queryFn: () => getDuePeople(),
  })
  const { data: transactionsData } = useQuery({
    queryKey: ["due-transactions"],
    queryFn: () => getDueTransactions(),
  })

  const people = (peopleData?.data ?? []) as IDuePerson[]
  const transactions = (transactionsData?.data ?? []) as IDueTransaction[]

  const owedByAgency = people
    .filter((person) => person.balance_bdt > 0)
    .reduce((running, person) => running + person.balance_bdt, 0)
  const owedToAgency = people
    .filter((person) => person.balance_bdt < 0)
    .reduce((running, person) => running + Math.abs(person.balance_bdt), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="The agency owes"
            value={formatBdt(owedByAgency)}
            hint="Taken from people and not yet given back"
            icon={<ArrowUpRight className="size-5" />}
            tone={4}
          />
          <StatTile
            label="Owed to the agency"
            value={formatBdt(owedToAgency)}
            hint="Given out and not yet returned"
            icon={<ArrowDownLeft className="size-5" />}
            tone={3}
          />
        </div>

        <div className="flex gap-2">
          <AddPersonModal />
          <RecordTransactionModal people={people} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Balance per person</CardTitle>
          </CardHeader>

          {isLoading && people.length === 0 ? (
            <div className="h-40 animate-pulse bg-muted/40" />
          ) : people.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-muted-foreground">
              <Scale className="size-7" aria-hidden="true" />
              Nobody added yet.
            </p>
          ) : (
            <ul className="divide-y">
              {people.map((person) => {
                const owesAgency = person.balance_bdt < 0
                const settled = person.balance_bdt === 0

                return (
                  <li
                    key={person.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatBdt(person.total_received_bdt)} in ·{" "}
                        {formatBdt(person.total_payment_bdt)} out
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums">
                        {formatBdt(Math.abs(person.balance_bdt))}
                      </p>
                      {/* Which way it points, in words — a signed number alone
                          makes every reader work the convention out again. */}
                      <p className="text-xs text-muted-foreground">
                        {settled ? "settled" : owesAgency ? "they owe you" : "you owe them"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>

          {transactions.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nothing recorded yet.
            </p>
          ) : (
            <ul className="divide-y">
              {transactions.slice(0, 12).map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{transaction.due_person?.name ?? "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                      {transaction.account ? ` · ${transaction.account.name}` : ""}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-medium tabular-nums ${
                      transaction.direction === "received" ? "text-chart-3" : "text-chart-2"
                    }`}
                  >
                    {transaction.direction === "received" ? "+" : "−"}
                    {formatBdt(transaction.amount_bdt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DuePaymentsBoard
