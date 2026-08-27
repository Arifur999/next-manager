"use client"

import RecordExpenseModal from "@/components/modules/Admin/Expenses/RecordExpenseModal"
import { expensesColumns } from "@/components/modules/Admin/Expenses/expensesColumns"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { getExpenses } from "@/services/agencio.services"
import type { IExpense } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import { Receipt, Users } from "lucide-react"
import { useState } from "react"

const ExpensesTable = () => {
  const [search, setSearch] = useState("")

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["expenses", search],
    queryFn: () => getExpenses(search ? `search=${encodeURIComponent(search)}` : undefined),
  })

  const expenses = (data?.data ?? []) as IExpense[]

  // Split the way the reports do: employee-type costs sit alongside team
  // payouts, and folding them into operating expenses would double-count.
  const operating = expenses.filter((e) => e.category?.type !== "employee")
  const employee = expenses.filter((e) => e.category?.type === "employee")
  const total = (rows: IExpense[]) => rows.reduce((running, row) => running + row.amount_bdt, 0)

  // Category totals for the listed range, biggest first.
  const byCategory = Object.values(
    expenses.reduce<Record<string, { name: string; total: number }>>((groups, expense) => {
      const key = expense.category?.id ?? "uncategorised"
      const name = expense.category?.name ?? "Uncategorised"
      groups[key] = { name, total: (groups[key]?.total ?? 0) + expense.amount_bdt }
      return groups
    }, {}),
  ).sort((a, b) => b.total - a.total)

  const grand = total(expenses)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Operating expenses"
          value={formatBdt(total(operating))}
          hint={`${operating.length} entr${operating.length === 1 ? "y" : "ies"}`}
          icon={<Receipt className="size-5" />}
          tone={4}
        />
        <StatTile
          label="Employee costs"
          value={formatBdt(total(employee))}
          hint="Reported alongside team payouts, not with operating costs"
          icon={<Users className="size-5" />}
          tone={5}
        />

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>

          {byCategory.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <ul className="divide-y">
              {byCategory.slice(0, 5).map((group) => (
                <li key={group.name} className="px-5 py-2.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{group.name}</span>
                    <span className="shrink-0 tabular-nums">{formatBdt(group.total)}</span>
                  </div>
                  {/* A bar rather than a percentage: the shape of the split is
                      the point, and the exact figure is already beside it. */}
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${grand > 0 ? (group.total / grand) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <DataTable
        data={expenses}
        columns={expensesColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No expenses recorded yet."
        toolbarAction={<RecordExpenseModal />}
        search={{
          initialValue: search,
          placeholder: "Search vendor, notes or category...",
          onDebouncedChange: setSearch,
        }}
      />
    </div>
  )
}

export default ExpensesTable
