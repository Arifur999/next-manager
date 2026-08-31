"use client"

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
import type { IAccount, IPayrollRun } from "@/types/agencio.types"
import { format, parseISO } from "date-fns"
import { Trash2 } from "lucide-react"
import { useState } from "react"

/**
 * One month of payroll.
 *
 * A draft is editable and a completed run is not, and the card looks different
 * enough that nobody has to check which they are on: paid rows show the payout
 * they produced rather than an input.
 *
 * Paying is behind an explicit account choice, because that is the moment money
 * leaves a real account and there is no undo on this screen — reversing means
 * reversing the payouts, where they live.
 */

type Draft = Record<string, { gross: string; deductions: string }>

const PayrollRunCard = ({
  run,
  accounts,
  onSave,
  onPay,
  onDiscard,
}: {
  run: IPayrollRun
  accounts: IAccount[]
  onSave: (items: unknown[]) => void
  onPay: (accountId: string) => void
  onDiscard: () => void
}) => {
  const [draft, setDraft] = useState<Draft>({})
  const [accountId, setAccountId] = useState("")

  const isDraft = run.status === "draft"

  const valueOf = (itemId: string, field: "gross" | "deductions", stored: number) =>
    draft[itemId]?.[field] ?? (stored ? String(stored) : "")

  const change = (itemId: string, field: "gross" | "deductions", value: string) =>
    setDraft({
      ...draft,
      [itemId]: {
        gross: draft[itemId]?.gross ?? "",
        deductions: draft[itemId]?.deductions ?? "",
        [field]: value,
      },
    })

  const total = run.items.reduce((sum, item) => sum + Number(item.net_bdt), 0)
  const paidCount = run.items.filter((item) => item.payout_id).length

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            {format(parseISO(run.period_start), "MMMM yyyy")}
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
                  <p className="text-xs capitalize text-muted-foreground">
                    {item.user.role.replace(/_/g, " ")}
                  </p>
                </td>

                <td className="px-5 py-2.5">
                  {isDraft ? (
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={valueOf(item.id, "gross", Number(item.gross_bdt))}
                      onChange={(event) => change(item.id, "gross", event.target.value)}
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
                      onChange={(event) => change(item.id, "deductions", event.target.value)}
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
          <Button
            variant="outline"
            onClick={() =>
              onSave(
                Object.entries(draft).map(([id, values]) => ({
                  id,
                  gross_bdt: Number(values.gross || 0),
                  deductions_bdt: Number(values.deductions || 0),
                }))
              )
            }
            disabled={Object.keys(draft).length === 0}
          >
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

          <Button disabled={!accountId || total <= 0} onClick={() => onPay(accountId)}>
            Pay {formatBdt(total)}
          </Button>

          <p className="w-full text-xs text-muted-foreground">
            Paying writes one team payout per person and moves the money out of that
            account. It cannot be undone here — a mistake is corrected by reversing the
            payouts where they live.
          </p>
        </div>
      )}
    </Card>
  )
}

export default PayrollRunCard
