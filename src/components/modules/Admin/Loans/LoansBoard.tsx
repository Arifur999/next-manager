"use client"

import {
  createLoanAction,
  deleteLoanAction,
  payLoanInstalmentAction,
  reverseLoanInstalmentAction,
  updateLoanAction,
} from "@/app/(dashboardLayout)/admin/dashboard/loans/_action"
import LoanCard from "@/components/modules/Admin/Loans/LoanCard"
import LoanFormCard from "@/components/modules/Admin/Loans/LoanFormCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Landmark } from "lucide-react"
import { toast } from "sonner"
import { accountsQuery, loanSummaryQuery, loansListQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * What the agency owes, and to whom.
 *
 * The board holds only what the loans share; one loan is its own component, and
 * so is its schedule. Every figure on this page is derived by the server from
 * the instalments — nothing here adds anything up itself, so a number on the
 * summary strip cannot disagree with the card underneath it.
 */
const LoansBoard = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(loansListQuery())
  const { data: summaryData } = useQuery(loanSummaryQuery())
  const { data: accountData } = useQuery(accountsQuery())

  const loans = data?.data ?? []
  const summary = summaryData?.data
  // Borrowing is in BDT, like every other record that is not a client payment.
  const accounts = ((accountData?.data ?? [])).filter(
    (account) => account.currency === "BDT" && account.is_active
  )

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.loans.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.loanSummary.all })
    // Every one of these moves an account and writes the ledger.
    void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
  }

  const settle = (fallback: string) => (result: { success: boolean; message?: string }) => {
    if (!result.success) {
      toast.error(result.message || fallback)
      return
    }
    // The server says what is left owed; repeating it here would be a second
    // place for that number to live.
    toast.success(result.message)
    refresh()
  }

  const { mutate: record, isPending } = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLoanAction(payload),
    onSuccess: settle("Could not record it"),
  })

  const { mutate: pay } = useMutation({
    mutationFn: ({ id, accountId }: { id: string; accountId: string }) =>
      payLoanInstalmentAction(id, { account_id: accountId }),
    onSuccess: settle("Could not pay it"),
  })

  const { mutate: reverse } = useMutation({
    mutationFn: (id: string) => reverseLoanInstalmentAction(id),
    onSuccess: settle("Could not reverse it"),
  })

  const { mutate: close } = useMutation({
    mutationFn: (id: string) => updateLoanAction(id, { status: "closed" }),
    onSuccess: settle("Could not close it"),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteLoanAction(id),
    // "This loan has repayments recorded. Close it instead" arrives here.
    onSuccess: settle("Could not delete it"),
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <LoanFormCard accounts={accounts} onSubmit={record} isPending={isPending} />

      <div className="space-y-4">
        {summary && summary.loan_count > 0 && (
          <Card className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Still owed</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatBdt(summary.outstanding_bdt)}
              </p>
              <p className="text-xs text-muted-foreground">
                across {summary.active_count} active{" "}
                {summary.active_count === 1 ? "loan" : "loans"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Borrowed in total</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatBdt(summary.borrowed_bdt)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBdt(summary.principal_paid_bdt)} returned
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interest paid</p>
              <p className="text-xl font-semibold tabular-nums">
                {formatBdt(summary.interest_paid_bdt)}
              </p>
              {/* Said plainly, because it is the one thing people get wrong. */}
              <p className="text-xs text-muted-foreground">
                the only part that is a cost
              </p>
            </div>

            {summary.next_due.length > 0 && (
              <p className="text-xs text-muted-foreground sm:col-span-3">
                Next due: {summary.next_due[0].lender} ·{" "}
                {formatBdt(summary.next_due[0].total_bdt)} on{" "}
                {format(parseISO(summary.next_due[0].due_date), "d MMM yyyy")}
              </p>
            )}
          </Card>
        )}

        {isLoading && loans.length === 0 ? (
          <Card>
            <LoadingBlock rounded />
          </Card>
        ) : loans.length === 0 ? (
          <Card>
            <EmptyState icon={Landmark}>Nothing borrowed.</EmptyState>
          </Card>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              accounts={accounts}
              onPay={(instalmentId, accountId) => pay({ id: instalmentId, accountId })}
              onReverse={(instalmentId) => reverse(instalmentId)}
              onClose={() => close(loan.id)}
              onDelete={() => remove(loan.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default LoansBoard
