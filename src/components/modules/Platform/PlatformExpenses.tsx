"use client"

import {
  addPlatformExpenseAction,
  removePlatformExpenseAction,
} from "@/app/(dashboardLayout)/platform/_financeAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { usd } from "@/components/shared/kpi/MetricTile"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { platformExpensesListQuery } from "@/queries/platform.queries"
import type { IPlatformExpense } from "@/types/platform.types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Receipt, Trash2 } from "lucide-react"
import { useState } from "react"

// The report's totals are built from the expenses, so both refetch together.
const FINANCE_KEYS = [queryKeys.platformFinance.all, queryKeys.platformExpenses.all]

// What running the platform costs in the report's window: record one, or remove one.
const PlatformExpenses = ({ range }: { range: string }) => {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [removing, setRemoving] = useState<IPlatformExpense | null>(null)

  const expensesQuery = useQuery({
    ...platformExpensesListQuery(range),
    placeholderData: keepPreviousData,
  })

  const expenses = expensesQuery.data?.data ?? []

  const { run: recordExpense, isPending } = useActionMutation({
    action: addPlatformExpenseAction,
    successMessage: "Recorded",
    invalidateKeys: FINANCE_KEYS,
    refresh: false,
  })

  const { run: removeExpense, isPending: isRemoving } = useActionMutation({
    action: removePlatformExpenseAction,
    // The row leaving the list says it.
    successMessage: false,
    invalidateKeys: FINANCE_KEYS,
    refresh: false,
  })

  const handleRemove = async () => {
    if (removing && (await removeExpense(removing.id))) setRemoving(null)
  }

  const handleRecord = async () => {
    if (!(await recordExpense({ date, description, category, amount_usd: amount }))) return

    setDescription("")
    setCategory("")
    setAmount("")
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">What it costs to run</CardTitle>
          <p className="text-sm text-muted-foreground">
            Servers, domains, the mail plan, what the team is paid. USD, so it subtracts
            from subscription revenue without a conversion in between.
          </p>
        </CardHeader>

        <form
          className="flex flex-wrap items-end gap-3 border-b px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!description.trim() || !amount.trim()) return
            void handleRecord()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="min-w-44 flex-1 space-y-1.5">
            <Label htmlFor="expense-description">What for</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Database hosting"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-category">Category</Label>
            <Input
              id="expense-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Infrastructure"
              className="w-36"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-amount">$ </Label>
            <Input
              id="expense-amount"
              type="number"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-28 tabular-nums"
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending || !description.trim() || !amount.trim()}>
            Record
          </Button>
        </form>

        <PanelState
          query={expensesQuery}
          errorMessage="The expenses did not load."
          isEmpty={expenses.length === 0}
          empty={<EmptyState icon={Receipt}>Nothing recorded in this window.</EmptyState>}
        >
          <ul className="divide-y">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{expense.description}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(parseISO(expense.date), "d MMM yyyy")}
                    {expense.category ? ` · ${expense.category}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium tabular-nums">
                    {usd(expense.amount_usd)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isRemoving}
                    onClick={() => setRemoving(expense)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Remove {expense.description}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </PanelState>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title="Remove this expense?"
        description={
          removing && (
            <>
              <span className="font-medium text-foreground">{removing.description}</span>,{" "}
              {usd(removing.amount_usd)}, comes off this window&apos;s costs. The removal is
              recorded in admin activity.
            </>
          )
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
      />
    </>
  )
}

export default PlatformExpenses
