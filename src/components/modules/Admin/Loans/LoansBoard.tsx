"use client"

import {
  closeLoanAction,
  createLoanAction,
  deleteLoanAction,
  payLoanInstalmentAction,
  reverseLoanInstalmentAction,
} from "@/app/(dashboardLayout)/admin/dashboard/loans/_action"
import LoanCard from "@/components/modules/Admin/Loans/LoanCard"
import LoanFormCard from "@/components/modules/Admin/Loans/LoanFormCard"
import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Landmark } from "lucide-react"
import { accountsQuery, loanSummaryQuery, loansListQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"

// Every loan change moves an account and writes the ledger.
const LOAN_KEYS = [
  queryKeys.loans.all,
  queryKeys.loanSummary.all,
  queryKeys.accounts.all,
  queryKeys.transactions.all,
]

/**
 * What the agency owes, and to whom.
 *
 * The board holds only what the loans share; one loan is its own component, and
 * so is its schedule. Every figure on this page is derived by the server from
 * the instalments — nothing here adds anything up itself, so a number on the
 * summary strip cannot disagree with the card underneath it.
 */
const LoansBoard = () => {
  const { data, isLoading } = useQuery(loansListQuery())
  const { data: summaryData } = useQuery(loanSummaryQuery())
  const { data: accountData } = useQuery(accountsQuery())

  const loans = data?.data ?? []
  const summary = summaryData?.data
  // Borrowing is in BDT, like every other record that is not a client payment.
  const accounts = ((accountData?.data ?? [])).filter(
    (account) => account.currency === "BDT" && account.is_active
  )

  // No successMessage: the server's own message is the toast, and after a
  // payment it says what is left owed, a number that should live in one place.
  const { run: recordLoan, isPending } = useActionMutation({
    action: createLoanAction,
    invalidateKeys: LOAN_KEYS,
    refresh: false,
  })

  const { run: payInstalment } = useActionMutation({
    action: ({ id, accountId }: { id: string; accountId: string }) =>
      payLoanInstalmentAction(id, { account_id: accountId }),
    invalidateKeys: LOAN_KEYS,
    refresh: false,
  })

  const { run: reverseInstalment } = useActionMutation({
    action: reverseLoanInstalmentAction,
    invalidateKeys: LOAN_KEYS,
    refresh: false,
  })

  const { run: closeLoan } = useActionMutation({
    action: closeLoanAction,
    invalidateKeys: LOAN_KEYS,
    refresh: false,
  })

  // "This loan has repayments recorded. Close it instead" is the failure toast.
  const { run: deleteLoan } = useActionMutation({
    action: deleteLoanAction,
    invalidateKeys: LOAN_KEYS,
    refresh: false,
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <LoanFormCard accounts={accounts} onSubmit={recordLoan} isPending={isPending} />

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
              onPay={(instalmentId, accountId) => void payInstalment({ id: instalmentId, accountId })}
              onReverse={(instalmentId) => void reverseInstalment(instalmentId)}
              onClose={() => void closeLoan(loan.id)}
              onDelete={() => void deleteLoan(loan.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default LoansBoard
