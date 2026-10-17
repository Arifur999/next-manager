"use client"

import DuePeopleList from "@/components/modules/Admin/DuePayments/DuePeopleList"
import DuePersonModal from "@/components/modules/Admin/DuePayments/DuePersonModal"
import DueTransactionsList from "@/components/modules/Admin/DuePayments/DueTransactionsList"
import RecordTransactionModal from "@/components/modules/Admin/DuePayments/RecordTransactionModal"
import StatTile from "@/components/shared/StatTile"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { duePeopleQuery, dueTransactionsListQuery } from "@/queries/spending.queries"

// Informal lending, in and out. A positive balance means the agency has taken
// more from that person than it gave back, so the agency owes them.

const DuePaymentsBoard = () => {
  const peopleQuery = useQuery(duePeopleQuery())
  const transactionsQuery = useQuery(dueTransactionsListQuery())

  const people = peopleQuery.data?.data ?? []
  const transactions = transactionsQuery.data?.data ?? []

  const owedByAgency = people
    .filter((person) => person.balance_bdt > 0)
    .reduce((running, person) => running + person.balance_bdt, 0)
  const owedToAgency = people
    .filter((person) => person.balance_bdt < 0)
    .reduce((running, person) => running + Math.abs(person.balance_bdt), 0)
  // A dash, not a zero, when the balances did not arrive.
  const balanceLabel = (amount: number) => (peopleQuery.isError ? "—" : formatBdt(amount))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="The agency owes"
            value={balanceLabel(owedByAgency)}
            hint="Taken from people and not yet given back"
            icon={<ArrowUpRight className="size-5" />}
            tone={4}
          />
          <StatTile
            label="Owed to the agency"
            value={balanceLabel(owedToAgency)}
            hint="Given out and not yet returned"
            icon={<ArrowDownLeft className="size-5" />}
            tone={3}
          />
        </div>

        <div className="flex gap-2">
          <DuePersonModal />
          <RecordTransactionModal people={people} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Balance per person</CardTitle>
          </CardHeader>
          <DuePeopleList query={peopleQuery} people={people} />
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>
          <DueTransactionsList query={transactionsQuery} transactions={transactions} />
        </Card>
      </div>
    </div>
  )
}

export default DuePaymentsBoard
