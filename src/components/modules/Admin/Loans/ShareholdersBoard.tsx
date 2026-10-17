"use client"

import {
  createDistributionAction,
  createShareholderAction,
  deleteDistributionAction,
  deleteShareholderAction,
  updateShareholderAction,
} from "@/app/(dashboardLayout)/admin/dashboard/shareholders/_action"
import DistributionFormCard from "@/components/modules/Admin/Loans/DistributionFormCard"
import DistributionList from "@/components/modules/Admin/Loans/DistributionList"
import ShareholderFormCard from "@/components/modules/Admin/Loans/ShareholderFormCard"
import ShareholderList from "@/components/modules/Admin/Loans/ShareholderList"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import type { IShareholder, IShareholderDistribution } from "@/types/finance.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatBdt } from "@/lib/currency"
import { useQuery } from "@tanstack/react-query"
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

// Who owns the agency and what has been paid to them: the queries and mutations
// behind two forms and two lists. The server checks shares against 100% across
// everybody still active, and its refusal says how much the others hold.
const ShareholdersBoard = () => {
  const [shareholderToDelete, setShareholderToDelete] = useState<IShareholder | null>(null)
  const [distributionToReverse, setDistributionToReverse] = useState<IShareholderDistribution | null>(null)

  const ownersQuery = useQuery(shareholdersQuery())
  const distributionQuery = useQuery(distributionsListQuery())
  const { data: accountData } = useQuery(accountsQuery())

  const shareholders = ownersQuery.data?.data ?? []
  const distributions = distributionQuery.data?.data ?? []
  const accounts = (accountData?.data ?? []).filter(
    (account) => account.currency === "BDT" && account.is_active
  )
  // The server counts this across active holders; reading it back rather than
  // recomputing keeps one answer to "who owns the rest".
  const unallocated = ownersQuery.data?.meta?.unallocated_pct ?? null

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

  const { run: deleteShareholder, isPending: isDeleting } = useActionMutation({
    action: deleteShareholderAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const handleConfirmDelete = async () => {
    if (shareholderToDelete && (await deleteShareholder(shareholderToDelete.id))) {
      setShareholderToDelete(null)
    }
  }

  const { run: payDistribution, isPending: paying } = useActionMutation({
    action: createDistributionAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const { run: reverseDistribution, isPending: isReversing } = useActionMutation({
    action: deleteDistributionAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

  const handleConfirmReverse = async () => {
    if (distributionToReverse && (await reverseDistribution(distributionToReverse.id))) {
      setDistributionToReverse(null)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <ShareholderFormCard onSubmit={addShareholder} isPending={isPending} />

        <DistributionFormCard
          shareholders={shareholders}
          accounts={accounts}
          onSubmit={payDistribution}
          isPending={paying}
        />
      </div>

      <div className="space-y-4">
        <ShareholderList
          shareholders={shareholders}
          unallocatedPct={unallocated}
          query={ownersQuery}
          onToggle={(shareholder) => void toggleShareholder(shareholder)}
          onDelete={setShareholderToDelete}
        />
        <DistributionList
          distributions={distributions}
          query={distributionQuery}
          onDelete={setDistributionToReverse}
        />
      </div>

      <ConfirmDialog
        open={shareholderToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setShareholderToDelete(null)
        }}
        title="Delete this shareholder?"
        description={
          <>
            This removes <span className="font-medium text-foreground">{shareholderToDelete?.name}</span> and
            frees their share. Somebody who has been paid a distribution cannot be deleted — retire
            them instead, so the payments still say who they went to.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />

      <ConfirmDialog
        open={distributionToReverse !== null}
        onOpenChange={(open) => {
          if (!open) setDistributionToReverse(null)
        }}
        title="Reverse this distribution?"
        description={
          <>
            The {distributionToReverse ? formatBdt(distributionToReverse.amount_bdt) : ""} paid to{" "}
            <span className="font-medium text-foreground">{distributionToReverse?.shareholder?.name}</span> goes
            back into {distributionToReverse?.account?.name ?? "the account it came from"}, and the payment
            leaves their total.
          </>
        }
        variant="destructive"
        confirmLabel="Reverse"
        pendingLabel="Reversing..."
        isPending={isReversing}
        onConfirm={() => void handleConfirmReverse()}
      />
    </div>
  )
}

export default ShareholdersBoard
