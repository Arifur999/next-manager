"use client"

import {
  addPlatformExpenseAction,
  removePlatformExpenseAction,
} from "@/app/(dashboardLayout)/platform/_financeAction"
import MetricTile, { count, pct, usd } from "@/components/shared/kpi/MetricTile"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getPlatformExpenses, getPlatformFinance } from "@/services/agencio.services"
import type { IPlatformExpense, IPlatformFinance } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns"
import { Receipt, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * AGENCIO's own money: what comes in from subscriptions, what goes out to run
 * it, and what is left.
 *
 * No customer's books are on this screen and none can be — the API does not
 * return those columns, and the smoke suite greps the response to prove it.
 *
 * The window defaults to this month, so "net" compares a monthly recurring
 * figure against a month of costs rather than against everything ever spent.
 */

const iso = (date: Date) => format(date, "yyyy-MM-dd")

const PlatformFinance = () => {
  const queryClient = useQueryClient()
  const today = new Date()

  const [from, setFrom] = useState(iso(startOfMonth(today)))
  const [to, setTo] = useState(iso(endOfMonth(today)))

  const [date, setDate] = useState(iso(today))
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")

  const range = `from=${from}&to=${to}`

  const { data: financeData, isLoading } = useQuery({
    queryKey: ["platform-finance", range],
    queryFn: () => getPlatformFinance(range),
  })

  const { data: expensesData } = useQuery({
    queryKey: ["platform-expenses", range],
    queryFn: () => getPlatformExpenses(range),
  })

  const finance = financeData?.data as IPlatformFinance | undefined
  const expenses = (expensesData?.data ?? []) as IPlatformExpense[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["platform-finance"] })
    void queryClient.invalidateQueries({ queryKey: ["platform-expenses"] })
  }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () =>
      addPlatformExpenseAction({
        date,
        description: description.trim(),
        category: category.trim(),
        amount_usd: Number(amount),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not record the expense")
        return
      }
      toast.success("Recorded")
      setDescription("")
      setCategory("")
      setAmount("")
      refresh()
    },
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => removePlatformExpenseAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not remove it")
        return
      }
      refresh()
    },
  })

  if (isLoading && !finance) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
  }

  if (!finance) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="finance-from">From</Label>
          <Input
            id="finance-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="finance-to">To</Label>
          <Input
            id="finance-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
        <p className="pb-2 text-xs text-muted-foreground">
          {/* Which figures move with the dates and which do not, said plainly. */}
          Costs and churn use this window. Revenue is what is recurring right now.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricTile
          label="Net"
          metric={{ value: finance.net_usd }}
          format={usd}
          size="lead"
          tone={finance.net_usd >= 0 ? 3 : 2}
          hint={`${usd(finance.mrr_usd)} recurring, less ${usd(finance.expenses_usd)} spent in this window`}
        />
        <MetricTile
          label="Monthly revenue"
          metric={{ value: finance.mrr_usd }}
          format={usd}
          tone={1}
          hint={`${usd(finance.arr_usd)} a year at today's rate · counts past due, since it is owed`}
        />
        <MetricTile
          label="Per customer"
          metric={{
            value: finance.arpa_usd,
            // Null is a real answer here and the tile says why rather than
            // showing a zero somebody would read as "we earn nothing".
            reason: "Nobody is paying yet, so there is nothing to divide",
          }}
          format={usd}
          tone={3}
          hint={`Across ${finance.paying_companies} paying of ${finance.total_companies} companies`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Spent in window"
          metric={{ value: finance.expenses_usd }}
          format={usd}
          tone={2}
          hint={`${finance.expense_count} ${finance.expense_count === 1 ? "entry" : "entries"}`}
        />
        <MetricTile
          label="Churn"
          metric={{
            value: finance.churn_rate_pct,
            reason: "Nobody has paid or left yet",
          }}
          format={pct}
          tone={2}
          hint={`${finance.churned_in_window} left in this window`}
        />
        <MetricTile
          label="On trial"
          metric={{ value: finance.by_status.trialing }}
          format={count}
          tone={1}
          hint="Worth nothing yet, by definition"
        />
        <MetricTile
          label="Past due"
          metric={{ value: finance.by_status.past_due }}
          format={count}
          tone={2}
          hint="Counted in revenue — the money is still owed"
        />
      </div>

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
            add()
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

        {expenses.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
            <Receipt className="size-7" aria-hidden="true" />
            Nothing recorded in this window.
          </p>
        ) : (
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
                    onClick={() => remove(expense.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Remove {expense.description}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default PlatformFinance
