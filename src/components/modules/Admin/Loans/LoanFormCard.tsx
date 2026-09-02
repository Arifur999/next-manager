"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IAccount } from "@/types/agencio.types"
import { format } from "date-fns"
import { useState } from "react"

/**
 * Recording a loan.
 *
 * The account is optional, and that is deliberate: a loan already part repaid
 * when it is first entered never landed in an account here, and picking one
 * would invent money that never arrived.
 *
 * A schedule is generated from the term as a starting point, with interest left
 * at zero rather than guessed — a made-up interest figure would flow straight
 * into profit and loss. The agency then corrects the rows to match the paper it
 * actually signed.
 */
const LoanFormCard = ({
  accounts,
  onSubmit,
  isPending,
}: {
  accounts: IAccount[]
  onSubmit: (payload: Record<string, unknown>) => void
  isPending: boolean
}) => {
  const [lender, setLender] = useState("")
  const [principal, setPrincipal] = useState("")
  const [rate, setRate] = useState("")
  const [startedOn, setStartedOn] = useState(format(new Date(), "yyyy-MM-dd"))
  const [months, setMonths] = useState("12")
  const [accountId, setAccountId] = useState("")

  const submit = () => {
    onSubmit({
      lender: lender.trim(),
      principal_bdt: Number(principal),
      interest_rate: Number(rate || 0),
      started_on: startedOn,
      term_months: Number(months),
      ...(accountId ? { account_id: accountId } : {}),
    })
    setLender("")
    setPrincipal("")
    setRate("")
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Record a loan</CardTitle>
        <p className="text-sm text-muted-foreground">
          A bank loan or EMI. Money lent between people belongs on Due Payments — that has
          no schedule, no interest and no term.
        </p>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!lender.trim() || !Number(principal) || !Number(months)) return
          submit()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="loan-lender">Who lent it</Label>
          <Input
            id="loan-lender"
            value={lender}
            maxLength={120}
            onChange={(event) => setLender(event.target.value)}
            placeholder="City Bank"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="loan-principal">Amount</Label>
          <Input
            id="loan-principal"
            type="number"
            min={1}
            step="1"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="loan-months">Months</Label>
            <Input
              id="loan-months"
              type="number"
              min={1}
              max={600}
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loan-rate">Rate a year (%)</Label>
            <Input
              id="loan-rate"
              type="number"
              min={0}
              step="0.001"
              value={rate}
              placeholder="0"
              onChange={(event) => setRate(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="loan-start">Started on</Label>
          <Input
            id="loan-start"
            type="date"
            value={startedOn}
            onChange={(event) => setStartedOn(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="loan-account">Paid into</Label>
          <Select value={accountId} onValueChange={setAccountId} disabled={isPending}>
            <SelectTrigger id="loan-account" className="w-full">
              <SelectValue placeholder="Nowhere — already part repaid" />
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
            Leave it empty for a loan you are entering after the fact. Choosing an account
            puts the money into it — the cash is real, but it is borrowed, so it never
            counts as revenue.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending || !lender.trim() || !Number(principal)}
          className="w-full"
        >
          Record it
        </Button>

        <p className="text-xs text-muted-foreground">
          A schedule is filled in for the whole term with interest at zero. Edit the rows
          to match your bank&apos;s own table — a guessed interest figure would land
          straight in your profit.
        </p>
      </form>
    </Card>
  )
}

export default LoanFormCard
