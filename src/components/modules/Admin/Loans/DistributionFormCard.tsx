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
import type { IAccount, IShareholder } from "@/types/finance.types"
import type { IDistributionFormValues } from "@/zod/finance.validation"
import { format } from "date-fns"
import { useState } from "react"

const DistributionFormCard = ({
  shareholders,
  accounts,
  onSubmit,
  isPending,
}: {
  shareholders: IShareholder[]
  accounts: IAccount[]
  // Resolves true once the distribution is recorded.
  onSubmit: (values: IDistributionFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const [shareholderId, setShareholderId] = useState("")
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const handlePayOut = async () => {
    const isPaid = await onSubmit({
      shareholder_id: shareholderId,
      date,
      amount_bdt: amount,
      account_id: accountId,
    })
    if (isPaid) setAmount("")
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pay a distribution</CardTitle>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!shareholderId || !accountId || !Number(amount)) return
          void handlePayOut()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="distribution-who">Who</Label>
          <Select
            value={shareholderId}
            onValueChange={setShareholderId}
            disabled={isPending}
          >
            <SelectTrigger id="distribution-who" className="w-full">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {shareholders
                .filter((shareholder) => shareholder.is_active)
                .map((shareholder) => (
                  <SelectItem key={shareholder.id} value={shareholder.id}>
                    {shareholder.name} ({shareholder.share_pct}%)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="distribution-amount">Amount</Label>
          <Input
            id="distribution-amount"
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="distribution-date">Date</Label>
          <Input
            id="distribution-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="distribution-account">Paid from</Label>
          <Select value={accountId} onValueChange={setAccountId} disabled={isPending}>
            <SelectTrigger id="distribution-account" className="w-full">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isPending || !shareholderId || !accountId || !Number(amount)}
          className="w-full"
        >
          Pay it
        </Button>

        <p className="text-xs text-muted-foreground">
          This moves money out of that account, but it is not a cost — your profit for
          the month does not change because you paid yourself.
        </p>
      </form>
    </Card>
  )
}

export default DistributionFormCard
