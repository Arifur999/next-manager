"use client"

import {
  createDistributionAction,
  createShareholderAction,
  deleteDistributionAction,
  deleteShareholderAction,
  updateShareholderAction,
} from "@/app/(dashboardLayout)/admin/dashboard/shareholders/_action"
import DistributionList from "@/components/modules/Admin/Loans/DistributionList"
import ShareholderList from "@/components/modules/Admin/Loans/ShareholderList"
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
import type { IShareholder } from "@/types/finance.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useState } from "react"
import { accountsQuery, distributionsListQuery, shareholdersQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"

// Paying or reversing a distribution moves an account and writes the ledger.
const SHAREHOLDER_KEYS = [
  queryKeys.shareholders.all,
  queryKeys.distributions.all,
  queryKeys.accounts.all,
  queryKeys.transactions.all,
]
/**
 * Who owns the agency, and what has been paid to them.
 *
 * The two lists are their own components; this holds the forms and the wiring.
 * Share percentages are checked on the server against 100 across everybody
 * still active — the refusal names how much the others already hold, so the
 * message says what to do about it rather than only that it failed.
 */
const ShareholdersBoard = () => {
  const [name, setName] = useState("")
  const [pct, setPct] = useState("")
  const [shareholderId, setShareholderId] = useState("")
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const { data, isLoading } = useQuery(shareholdersQuery())
  const { data: distributionData, isLoading: loadingDistributions } = useQuery(distributionsListQuery())
  const { data: accountData } = useQuery(accountsQuery())

  const shareholders = data?.data ?? []
  const distributions = distributionData?.data ?? []
  const accounts = ((accountData?.data ?? [])).filter(
    (account) => account.currency === "BDT" && account.is_active
  )
  // The server counts this across active holders; reading it back rather than
  // recomputing keeps one answer to "who owns the rest".
  const unallocated =
    typeof data?.meta?.unallocated_pct === "number" ? data.meta.unallocated_pct : null

  // The server's own message is the success toast for all of these, and its
  // refusals ("Shares would total 120%. The others already hold 90%.") are
  // the failure toast.
  const { run: addShareholder, isPending } = useActionMutation({
    action: createShareholderAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const { run: toggleShareholder } = useActionMutation({
    action: (shareholder: IShareholder) =>
      updateShareholderAction(shareholder.id, { is_active: !shareholder.is_active }),
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const { run: deleteShareholder } = useActionMutation({
    action: deleteShareholderAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const { run: payDistribution, isPending: paying } = useActionMutation({
    action: createDistributionAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const { run: reverseDistribution } = useActionMutation({
    action: deleteDistributionAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const handleAdd = async () => {
    if (await addShareholder({ name, share_pct: pct })) {
      setName("")
      setPct("")
    }
  }

  const handlePayOut = async () => {
    const isPaid = await payDistribution({
      shareholder_id: shareholderId,
      date,
      amount_bdt: amount,
      account_id: accountId,
    })
    if (isPaid) setAmount("")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add a shareholder</CardTitle>
          </CardHeader>

          <form
            className="space-y-4 px-6 pb-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) return
              void handleAdd()
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="shareholder-name">Name</Label>
              <Input
                id="shareholder-name"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shareholder-pct">Share (%)</Label>
              <Input
                id="shareholder-pct"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={pct}
                placeholder="0"
                onChange={(event) => setPct(event.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Everybody still active has to add up to 100% or less. Retiring somebody
                frees their share for whoever takes it on.
              </p>
            </div>

            <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
              Add
            </Button>
          </form>
        </Card>

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
                disabled={paying}
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
                disabled={paying}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="distribution-date">Date</Label>
              <Input
                id="distribution-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={paying}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="distribution-account">Paid from</Label>
              <Select value={accountId} onValueChange={setAccountId} disabled={paying}>
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
              disabled={paying || !shareholderId || !accountId || !Number(amount)}
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
      </div>

      <div className="space-y-4">
        <ShareholderList
          shareholders={shareholders}
          unallocatedPct={unallocated}
          isLoading={isLoading}
          onToggle={(shareholder) => void toggleShareholder(shareholder)}
          onDelete={(id) => void deleteShareholder(id)}
        />
        <DistributionList
          distributions={distributions}
          isLoading={loadingDistributions}
          onDelete={(id) => void reverseDistribution(id)}
        />
      </div>
    </div>
  )
}

export default ShareholdersBoard
