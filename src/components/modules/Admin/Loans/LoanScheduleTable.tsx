"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBdt } from "@/lib/currency"
import type { IAccount, ILoanInstalment } from "@/types/finance.types"
import { format, isBefore, parseISO, startOfToday } from "date-fns"
import { Undo2 } from "lucide-react"
import { useState } from "react"

/**
 * One loan's repayment schedule.
 *
 * The two columns are the whole point of this table. Repaying principal settles
 * a liability and costs nothing; the interest is the actual cost of borrowing,
 * and it is the only part that reaches profit and loss. Showing them merged
 * would hide the one number an owner needs.
 *
 * An overdue row is marked from its due date rather than from a stored flag —
 * nothing has to run for a date to pass.
 */
const LoanScheduleTable = ({
  instalments,
  accounts,
  onPay,
  onReverse,
}: {
  instalments: ILoanInstalment[]
  accounts: IAccount[]
  onPay: (instalmentId: string, accountId: string) => void
  onReverse: (instalment: ILoanInstalment) => void
}) => {
  const [accountId, setAccountId] = useState("")
  const today = startOfToday()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 px-5 pt-4">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Pay from…" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Paying takes principal and interest together out of that account. Only the
          interest is a cost — the principal is money you already owed.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="border-y text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">#</th>
              <th className="px-5 py-2.5 font-medium">Due</th>
              <th className="px-5 py-2.5 text-right font-medium">Principal</th>
              <th className="px-5 py-2.5 text-right font-medium">Interest</th>
              <th className="px-5 py-2.5 text-right font-medium">Total</th>
              <th className="px-5 py-2.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {instalments.map((instalment) => {
              const dueDate = parseISO(instalment.due_date)
              const isOverdue = !instalment.paid_at && isBefore(dueDate, today)

              return (
                <tr key={instalment.id}>
                  <td className="px-5 py-2.5 text-muted-foreground">{instalment.seq}</td>
                  <td className="whitespace-nowrap px-5 py-2.5">
                    {format(dueDate, "d MMM yyyy")}
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">
                        overdue
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    {formatBdt(instalment.principal_bdt)}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    {formatBdt(instalment.interest_bdt)}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums">
                    {formatBdt(instalment.principal_bdt + instalment.interest_bdt)}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    {instalment.paid_at ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          paid {format(parseISO(instalment.paid_at), "d MMM")}
                          {instalment.paid_from_account ? ` · ${instalment.paid_from_account.name}` : ""}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onReverse(instalment)}
                          aria-label={`Reverse instalment ${instalment.seq}`}
                          title="Reverse"
                        >
                          <Undo2 className="size-4" />
                        </Button>
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!accountId}
                        onClick={() => onPay(instalment.id, accountId)}
                      >
                        Pay
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LoanScheduleTable
