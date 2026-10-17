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
import type { IShareholder } from "@/types/finance.types"
import { useActionMutation } from "@/hooks/useActionMutation"
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

/**
 * Who owns the agency, and what has been paid to them.
 *
 * The two forms and the two lists are their own components; this holds the wiring.
 * Share percentages are checked on the server against 100 across everybody
 * still active — the refusal names how much the others already hold, so the
 * message says what to do about it rather than only that it failed.
 */
const ShareholdersBoard = () => {
  const [shareholderToDelete, setShareholderToDelete] = useState<IShareholder | null>(null)

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

  const { run: reverseDistribution } = useActionMutation({
    action: deleteDistributionAction,
    invalidateKeys: SHAREHOLDER_KEYS,
    refresh: false,
  })

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
          isLoading={isLoading}
          onToggle={(shareholder) => void toggleShareholder(shareholder)}
          onDelete={setShareholderToDelete}
        />
        <DistributionList
          distributions={distributions}
          isLoading={loadingDistributions}
          onDelete={(id) => void reverseDistribution(id)}
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
    </div>
  )
}

export default ShareholdersBoard
