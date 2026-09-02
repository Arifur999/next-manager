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
import {
  getAccounts,
  getDistributions,
  getShareholders,
} from "@/services/agencio.services"
import type {
  IAccount,
  IShareholder,
  IShareholderDistribution,
} from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Who owns the agency, and what has been paid to them.
 *
 * The two lists are their own components; this holds the forms and the wiring.
 * Share percentages are checked on the server against 100 across everybody
 * still active — the refusal names how much the others already hold, so the
 * message says what to do about it rather than only that it failed.
 */
const ShareholdersBoard = () => {
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [pct, setPct] = useState("")
  const [shareholderId, setShareholderId] = useState("")
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const { data, isLoading } = useQuery({
    queryKey: ["shareholders"],
    queryFn: () => getShareholders(),
  })
  const { data: distributionData, isLoading: loadingDistributions } = useQuery({
    queryKey: ["distributions"],
    queryFn: () => getDistributions(),
  })
  const { data: accountData } = useQuery({ queryKey: ["accounts"], queryFn: () => getAccounts() })

  const shareholders = (data?.data ?? []) as IShareholder[]
  const distributions = (distributionData?.data ?? []) as IShareholderDistribution[]
  const accounts = ((accountData?.data ?? []) as IAccount[]).filter(
    (account) => account.currency === "BDT" && account.is_active
  )
  // The server counts this across active holders; reading it back rather than
  // recomputing keeps one answer to "who owns the rest".
  const unallocated =
    typeof data?.meta?.unallocated_pct === "number" ? data.meta.unallocated_pct : null

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["shareholders"] })
    void queryClient.invalidateQueries({ queryKey: ["distributions"] })
    void queryClient.invalidateQueries({ queryKey: ["accounts"] })
    void queryClient.invalidateQueries({ queryKey: ["transactions"] })
  }

  const settle =
    (fallback: string, done?: () => void) =>
    (result: { success: boolean; message?: string }) => {
      if (!result.success) {
        // "Shares would total 120%. The others already hold 90%." arrives here.
        toast.error(result.message || fallback)
        return
      }
      toast.success(result.message)
      done?.()
      refresh()
    }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () =>
      createShareholderAction({ name: name.trim(), share_pct: Number(pct || 0) }),
    onSuccess: settle("Could not add them", () => {
      setName("")
      setPct("")
    }),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (shareholder: IShareholder) =>
      updateShareholderAction(shareholder.id, { is_active: !shareholder.is_active }),
    onSuccess: settle("Could not update them"),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteShareholderAction(id),
    onSuccess: settle("Could not delete them"),
  })

  const { mutate: payOut, isPending: paying } = useMutation({
    mutationFn: () =>
      createDistributionAction({
        shareholder_id: shareholderId,
        date,
        amount_bdt: Number(amount),
        account_id: accountId,
      }),
    onSuccess: settle("Could not record it", () => setAmount("")),
  })

  const { mutate: reverse } = useMutation({
    mutationFn: (id: string) => deleteDistributionAction(id),
    onSuccess: settle("Could not reverse it"),
  })

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
              add()
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
              payOut()
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
          onToggle={(shareholder) => toggle(shareholder)}
          onDelete={(id) => remove(id)}
        />
        <DistributionList
          distributions={distributions}
          isLoading={loadingDistributions}
          onDelete={(id) => reverse(id)}
        />
      </div>
    </div>
  )
}

export default ShareholdersBoard
