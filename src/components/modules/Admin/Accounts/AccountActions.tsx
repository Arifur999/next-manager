"use client"

import { setAccountActiveAction } from "@/app/(dashboardLayout)/admin/dashboard/accounts/_action"
import RenameAccountDialog from "@/components/modules/Admin/Accounts/RenameAccountDialog"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import DataTableRowActions from "@/components/shared/table/DataTableRowActions"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatMoney } from "@/lib/currency"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { IAccount } from "@/types/finance.types"
import { Archive, ArchiveRestore, Pencil } from "lucide-react"
import { useState } from "react"

// Rename and deactivate for one account card row. An account that has been
// used cannot be deleted (its ledger rows would point at nothing), so
// deactivating is how it leaves the pickers; its balance and history stay.
const AccountActions = ({ account }: { account: IAccount }) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)

  const { run: setActive, isPending } = useActionMutation({
    action: (isActive: boolean) => setAccountActiveAction(account.id, { is_active: isActive }),
    successMessage: account.is_active ? `${account.name} deactivated` : `${account.name} is active again`,
    invalidateKeys: ledgerQueryKeys,
  })

  const handleDeactivate = async () => {
    if (await setActive(false)) setIsDeactivateOpen(false)
  }

  return (
    <>
      <DataTableRowActions
        row={account}
        actions={{
          extra: [
            { label: "Rename", icon: Pencil, onClick: () => setIsRenameOpen(true) },
            {
              label: "Deactivate",
              icon: Archive,
              destructive: true,
              hidden: () => !account.is_active,
              onClick: () => setIsDeactivateOpen(true),
            },
            {
              label: "Reactivate",
              icon: ArchiveRestore,
              hidden: () => account.is_active,
              onClick: () => void setActive(true),
            },
          ],
        }}
      />

      <RenameAccountDialog account={account} open={isRenameOpen} onOpenChange={setIsRenameOpen} />

      <ConfirmDialog
        open={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        title={`Deactivate ${account.name}?`}
        description={`It stops being offered when money is recorded. Its balance of ${formatMoney(account.balance, account.currency)} and everything recorded against it stay, and you can reactivate it at any time.`}
        variant="destructive"
        confirmLabel="Deactivate"
        pendingLabel="Deactivating..."
        isPending={isPending}
        onConfirm={() => void handleDeactivate()}
      />
    </>
  )
}

export default AccountActions
