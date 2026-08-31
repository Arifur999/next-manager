"use client"

import {
  completePayrollAction,
  createPayrollRunAction,
  deletePayrollRunAction,
  setPayrollItemsAction,
} from "@/app/(dashboardLayout)/admin/dashboard/payroll/_action"
import PayrollRunCard from "@/components/modules/Admin/People/PayrollRunCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAccounts, getPayrollRuns } from "@/services/agencio.services"
import type { IAccount, IPayrollRun } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * A month's salaries.
 *
 * The board holds only what the runs share; one run is its own component. The
 * screen says plainly that completing a run is what creates the money, because
 * that is the one irreversible action here — the payouts it writes are the same
 * rows a manual payout produces, and they cannot be un-written by coming back
 * to this page.
 */
const PayrollBoard = () => {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"))

  const { data, isLoading } = useQuery({ queryKey: ["payroll"], queryFn: () => getPayrollRuns() })
  const { data: accountData } = useQuery({ queryKey: ["accounts"], queryFn: () => getAccounts() })

  const runs = (data?.data ?? []) as IPayrollRun[]
  // Salaries are BDT, like every other team payout.
  const accounts = ((accountData?.data ?? []) as IAccount[]).filter(
    (account) => account.currency === "BDT" && account.is_active
  )

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["payroll"] })
    // Completing a run writes team payouts and moves the ledger.
    void queryClient.invalidateQueries({ queryKey: ["team-payouts"] })
    void queryClient.invalidateQueries({ queryKey: ["accounts"] })
    void queryClient.invalidateQueries({ queryKey: ["transactions"] })
  }

  const { mutate: open, isPending } = useMutation({
    mutationFn: () => {
      const start = startOfMonth(new Date(`${month}-01T00:00:00Z`))
      return createPayrollRunAction({
        period_start: format(start, "yyyy-MM-dd"),
        period_end: format(endOfMonth(start), "yyyy-MM-dd"),
      })
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not open it")
        return
      }
      toast.success("Payroll opened with a line per person")
      refresh()
    },
  })

  const { mutate: save } = useMutation({
    mutationFn: ({ id, items }: { id: string; items: unknown[] }) =>
      setPayrollItemsAction(id, { items }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save it")
        return
      }
      toast.success("Saved")
      refresh()
    },
  })

  const { mutate: pay } = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      completePayrollAction(id, { account_id: accountId }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not pay it")
        return
      }
      // The server counts what it actually paid.
      toast.success(result.message)
      refresh()
    },
  })

  const { mutate: discard } = useMutation({
    mutationFn: (id: string) => deletePayrollRunAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        // "That run has been paid. Reverse the payouts it created instead…"
        toast.error(result.message || "Could not discard it")
        return
      }
      toast.success("Draft discarded")
      refresh()
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Open a month</CardTitle>
        </CardHeader>

        <form
          className="flex flex-wrap items-end gap-3 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            open()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="payroll-month">Month</Label>
            <Input
              id="payroll-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              disabled={isPending}
              className="w-44"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            Open
          </Button>

          <p className="w-full text-xs text-muted-foreground">
            Opens a draft with everybody on it at zero. Nothing moves until you pay it.
          </p>
        </form>
      </Card>

      {isLoading && runs.length === 0 ? (
        <Card>
          <LoadingBlock rounded />
        </Card>
      ) : runs.length === 0 ? (
        <Card>
          <EmptyState icon={Wallet}>No payroll yet.</EmptyState>
        </Card>
      ) : (
        runs.map((run) => (
          <PayrollRunCard
            key={run.id}
            run={run}
            accounts={accounts}
            onSave={(items) => save({ id: run.id, items })}
            onPay={(accountId) => pay({ id: run.id, accountId })}
            onDiscard={() => discard(run.id)}
          />
        ))
      )}
    </div>
  )
}

export default PayrollBoard
