"use client"

import {
  completePayrollAction,
  createPayrollRunAction,
  deletePayrollRunAction,
  setPayrollItemsAction,
} from "@/app/(dashboardLayout)/admin/dashboard/payroll/_action"
import PayrollRunCard from "@/components/modules/Admin/People/PayrollRunCard"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IPayrollRun } from "@/types/people.types"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Wallet } from "lucide-react"
import { useState } from "react"
import { accountsQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"
import { payrollRunsQuery } from "@/queries/people.queries"
import type { IPayrollItemFormValues } from "@/zod/people.validation"

// Completing a run writes team payouts and moves the ledger.
const PAYROLL_KEYS = [
  queryKeys.payroll.all,
  queryKeys.payouts.all,
  queryKeys.accounts.all,
  queryKeys.transactions.all,
]

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
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"))
  const [discarding, setDiscarding] = useState<IPayrollRun | null>(null)

  const runList = useQuery(payrollRunsQuery())
  const accountList = useQuery(accountsQuery())

  const runs = runList.data?.data ?? []
  // Salaries are BDT, like every other team payout.
  const accounts = (accountList.data?.data ?? []).filter(
    (account) => account.currency === "BDT" && account.is_active
  )

  const { run: openPayroll, isPending } = useActionMutation({
    action: createPayrollRunAction,
    successMessage: "Payroll opened with a line per person",
    invalidateKeys: PAYROLL_KEYS,
    refresh: false,
  })

  const { run: savePayrollItems } = useActionMutation({
    action: ({ id, items }: { id: string; items: IPayrollItemFormValues[] }) =>
      setPayrollItemsAction(id, { items }),
    successMessage: "Saved",
    invalidateKeys: PAYROLL_KEYS,
    refresh: false,
  })

  // No successMessage: the server counts what it actually paid.
  const { run: payPayroll } = useActionMutation({
    action: ({ id, accountId }: { id: string; accountId: string }) =>
      completePayrollAction(id, { account_id: accountId }),
    invalidateKeys: PAYROLL_KEYS,
    refresh: false,
  })

  const { run: discardDraft, isPending: isDiscarding } = useActionMutation({
    action: deletePayrollRunAction,
    successMessage: "Draft discarded",
    invalidateKeys: PAYROLL_KEYS,
    refresh: false,
  })

  const confirmDiscard = async () => {
    if (discarding && (await discardDraft(discarding.id))) setDiscarding(null)
  }

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
            void openPayroll({ month })
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

      {/* The error shows only when nothing loaded: a run card holds figures
          being typed, and a failed refetch must not take them away. */}
      {runList.isError && runs.length === 0 && (
        <Card>
          <ErrorState
            message="Payroll did not load."
            onRetry={() => void runList.refetch()}
            isRetrying={runList.isFetching}
          />
        </Card>
      )}

      {runList.isLoading && (
        <Card>
          <LoadingBlock rounded />
        </Card>
      )}

      {runList.isSuccess && runs.length === 0 && (
        <Card>
          <EmptyState icon={Wallet}>No payroll yet.</EmptyState>
        </Card>
      )}

      {runs.map((run) => (
        <PayrollRunCard
          key={run.id}
          run={run}
          accounts={accounts}
          onSave={(items) => void savePayrollItems({ id: run.id, items })}
          onPay={(accountId) => void payPayroll({ id: run.id, accountId })}
          onDiscard={() => setDiscarding(run)}
        />
      ))}

      <ConfirmDialog
        open={discarding !== null}
        onOpenChange={(open) => {
          if (!open) setDiscarding(null)
        }}
        title="Discard this draft?"
        description={
          <>
            This throws away the{" "}
            <span className="font-medium text-foreground">
              {discarding ? format(parseISO(discarding.period_start), "MMMM yyyy") : ""}
            </span>{" "}
            draft and the figures typed into it. Nothing has been paid from it, so no money moves.
          </>
        }
        variant="destructive"
        confirmLabel="Discard"
        pendingLabel="Discarding..."
        isPending={isDiscarding}
        onConfirm={() => void confirmDiscard()}
      />
    </div>
  )
}

export default PayrollBoard
