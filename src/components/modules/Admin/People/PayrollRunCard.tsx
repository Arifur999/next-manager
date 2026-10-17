"use client"

import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBdt } from "@/lib/currency"
import type { IPayrollRun } from "@/types/people.types"
import { roleTitle } from "@/types/permission.types"
import type { IAccount } from "@/types/finance.types"
import type { IPayrollItemFormValues } from "@/zod/people.validation"
import { format, parseISO } from "date-fns"
import { Trash2 } from "lucide-react"
import { useState } from "react"

// One month of payroll: a draft has inputs, a paid run shows its payouts. Paying
// waits for an account, for the typed figures to be saved and for a yes, since
// money then leaves with no undo here.

type Draft = Record<string, { gross: string; deductions: string }>
type PayrollItem = IPayrollRun["items"][number]

const PayrollRunCard = ({
  run,
  accounts,
  onSave,
  onPay,
  onDiscard,
  isBusy,
}: {
  run: IPayrollRun
  accounts: IAccount[]
  onSave: (items: IPayrollItemFormValues[]) => Promise<boolean>
  onPay: (accountId: string) => Promise<boolean>
  onDiscard: () => void
  /** A save or payment is in flight, so neither can be sent twice. */
  isBusy: boolean
}) => {
  const [draft, setDraft] = useState<Draft>({})
  const [accountId, setAccountId] = useState("")
  const [isConfirmingPay, setIsConfirmingPay] = useState(false)

  const isDraft = run.status === "draft"
  // Pay sends the figures the server holds, not the ones in the boxes.
  const hasUnsavedFigures = Object.keys(draft).length > 0

  const valueOf = (itemId: string, field: "gross" | "deductions", stored: number) =>
    draft[itemId]?.[field] ?? (stored ? String(stored) : "")

  const change = (item: PayrollItem, field: "gross" | "deductions", value: string) =>
    setDraft({
      ...draft,
      [item.id]: {
        // The box not being edited keeps its saved figure; "" would save it as zero.
        gross: valueOf(item.id, "gross", Number(item.gross_bdt)),
        deductions: valueOf(item.id, "deductions", Number(item.deductions_bdt)),
        [field]: value,
      },
    })

  const saveFigures = async () => {
    const items = Object.entries(draft).map(([id, values]) => ({
      id,
      gross_bdt: values.gross,
      deductions_bdt: values.deductions,
    }))
    if (await onSave(items)) setDraft({})
  }

  const pay = async () => {
    if (await onPay(accountId)) setIsConfirmingPay(false)
  }

  const monthLabel = format(parseISO(run.period_start), "MMMM yyyy")
  const total = run.items.reduce((sum, item) => sum + Number(item.net_bdt), 0)
  const paidCount = run.items.filter((item) => item.payout_id).length
  // The server skips lines at zero, so they are not payouts either.
  const payoutCount = run.items.filter((item) => Number(item.net_bdt) > 0).length
  const accountName = accounts.find((account) => account.id === accountId)?.name

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            {monthLabel}
            <Badge variant={isDraft ? "outline" : "secondary"}>
              {isDraft ? "draft" : "paid"}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isDraft ? (
              <>Nothing has moved yet. {formatBdt(total)} across {run.items.length} people.</>
            ) : (
              <>
                {paidCount} {paidCount === 1 ? "salary" : "salaries"} paid
                {run.account ? ` from ${run.account.name}` : ""}
                {run.completed_at
                  ? ` on ${format(parseISO(run.completed_at), "d MMM yyyy")}`
                  : ""}
              </>
            )}
          </p>
        </div>

        {isDraft && (
          <Button size="icon" variant="ghost" onClick={onDiscard} aria-label="Discard this draft">
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Who</th>
              <th className="px-5 py-2.5 font-medium">Gross</th>
              <th className="px-5 py-2.5 font-medium">Deductions</th>
              <th className="px-5 py-2.5 text-right font-medium">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {run.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-2.5">
                  <p>{item.user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {roleTitle(item.user.role)}
                  </p>
                </td>

                <td className="px-5 py-2.5">
                  {isDraft ? (
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={valueOf(item.id, "gross", Number(item.gross_bdt))}
                      onChange={(event) => change(item, "gross", event.target.value)}
                      className="w-32"
                      aria-label={`Gross for ${item.user.full_name}`}
                    />
                  ) : (
                    <span className="tabular-nums">{formatBdt(Number(item.gross_bdt))}</span>
                  )}
                </td>

                <td className="px-5 py-2.5">
                  {isDraft ? (
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={valueOf(item.id, "deductions", Number(item.deductions_bdt))}
                      onChange={(event) => change(item, "deductions", event.target.value)}
                      className="w-32"
                      aria-label={`Deductions for ${item.user.full_name}`}
                    />
                  ) : (
                    <span className="tabular-nums">{formatBdt(Number(item.deductions_bdt))}</span>
                  )}
                </td>

                <td className="px-5 py-2.5 text-right">
                  <span className="tabular-nums">{formatBdt(Number(item.net_bdt))}</span>
                  {/* payout_id being set IS "paid" — there is no other flag,
                      so nothing here can disagree with the money. */}
                  {item.payout_id && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      paid
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDraft && (
        <div className="flex flex-wrap items-center gap-3 border-t px-5 py-4">
          <Button variant="outline" onClick={() => void saveFigures()} disabled={isBusy || !hasUnsavedFigures}>
            Save numbers
          </Button>

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

          <Button
            disabled={isBusy || hasUnsavedFigures || !accountId || total <= 0}
            onClick={() => setIsConfirmingPay(true)}
          >
            Pay {formatBdt(total)}
          </Button>

          <p className="w-full text-xs text-muted-foreground">
            {hasUnsavedFigures
              ? "Save the numbers first: paying sends the saved figures, not the ones being typed."
              : "Paying writes one team payout per person and moves the money out of that account. It cannot be undone here — a mistake is corrected by reversing the payouts where they live."}
          </p>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmingPay}
        onOpenChange={setIsConfirmingPay}
        title={`Pay ${monthLabel}?`}
        description={
          <>
            <span className="font-medium text-foreground">{formatBdt(total)}</span> leaves {accountName} as{" "}
            {payoutCount} team {payoutCount === 1 ? "payout" : "payouts"}. It cannot be undone here.
          </>
        }
        confirmLabel={`Pay ${formatBdt(total)}`}
        pendingLabel="Paying..."
        isPending={isBusy}
        onConfirm={() => void pay()}
      />
    </Card>
  )
}

export default PayrollRunCard
