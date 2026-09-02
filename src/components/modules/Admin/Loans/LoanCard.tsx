"use client"

import LoanScheduleTable from "@/components/modules/Admin/Loans/LoanScheduleTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatBdt } from "@/lib/currency"
import type { IAccount, ILoan } from "@/types/agencio.types"
import { format, parseISO } from "date-fns"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { useState } from "react"

/**
 * One loan.
 *
 * The headline is what is still owed, because that is the only number anybody
 * opens this page for. It is computed from the instalments by the server and
 * never stored, so it cannot disagree with the schedule below it.
 *
 * Interest paid is shown beside it and labelled as the cost, since that is the
 * part that is genuinely spending — the principal repaid is money that was
 * already owed and never appears in profit.
 */

const TONE: Record<ILoan["status"], "outline" | "secondary"> = {
  active: "outline",
  settled: "secondary",
  closed: "secondary",
}

const LoanCard = ({
  loan,
  accounts,
  onPay,
  onReverse,
  onClose,
  onDelete,
}: {
  loan: ILoan
  accounts: IAccount[]
  onPay: (instalmentId: string, accountId: string) => void
  onReverse: (instalmentId: string) => void
  onClose: () => void
  onDelete: () => void
}) => {
  const [open, setOpen] = useState(loan.status === "active")
  const isActive = loan.status === "active"

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-56 flex-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {loan.lender}
            <Badge variant={TONE[loan.status]}>{loan.status}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatBdt(loan.principal_bdt)} over {loan.term_months} months from{" "}
            {format(parseISO(loan.started_on), "MMM yyyy")}
            {loan.interest_rate > 0 ? ` · ${loan.interest_rate}% a year` : ""}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Still owed</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatBdt(loan.outstanding_bdt)}
            </p>
          </div>
          <div className="text-right">
            {/* Named as the cost on purpose: the principal beside it is not one. */}
            <p className="text-xs text-muted-foreground">Interest paid</p>
            <p className="text-sm tabular-nums">{formatBdt(loan.interest_paid_bdt)}</p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(!open)}
            aria-label={open ? `Hide ${loan.lender} schedule` : `Show ${loan.lender} schedule`}
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <>
          <LoanScheduleTable
            instalments={loan.instalments}
            accounts={accounts}
            onPay={onPay}
            onReverse={onReverse}
          />

          <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
            <p className="flex-1 text-xs text-muted-foreground">
              {loan.paid_count} of {loan.instalment_count} paid ·{" "}
              {formatBdt(loan.principal_paid_bdt)} of the principal returned
              {loan.next_due
                ? ` · next on ${format(parseISO(loan.next_due.due_date), "d MMM yyyy")}`
                : ""}
            </p>

            {isActive && loan.paid_count > 0 && (
              // A loan with repayments cannot be deleted — the ledger rows would
              // be left explaining nothing — so closing it is the way out.
              <Button size="sm" variant="outline" onClick={onClose}>
                Close it
              </Button>
            )}

            {loan.paid_count === 0 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                aria-label={`Delete the ${loan.lender} loan`}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  )
}

export default LoanCard
