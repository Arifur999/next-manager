"use client"

import { renameAccountAction } from "@/app/(dashboardLayout)/admin/dashboard/accounts/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { IAccount } from "@/types/finance.types"
import { accountRenameFormZodSchema, type IAccountRenameFormValues } from "@/zod/finance.validation"
import { useForm } from "@tanstack/react-form"

const RenameAccountForm = ({ account, onDone }: { account: IAccount; onDone: () => void }) => {
  const { run: renameAccount, isPending } = useActionMutation({
    action: (values: IAccountRenameFormValues) => renameAccountAction(account.id, values),
    successMessage: "Account renamed",
    // The name shows on every money list and in the ledger.
    invalidateKeys: ledgerQueryKeys,
  })

  const form = useForm({
    defaultValues: { name: account.name } satisfies IAccountRenameFormValues,
    onSubmit: async ({ value }) => {
      if (await renameAccount(value)) onDone()
    },
  })

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <form.Field name="name" validators={{ onChange: accountRenameFormZodSchema.shape.name }}>
        {(field) => <AppField field={field} label="Name" autoComplete="off" disabled={isPending} />}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
          Rename
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

type RenameAccountDialogProps = {
  account: IAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Currency and opening balance are fixed once saved, so the name is all there is to change.
const RenameAccountDialog = ({ account, open, onOpenChange }: RenameAccountDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent onInteractOutside={(event) => event.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Rename account</DialogTitle>
        <DialogDescription>
          Every payment, expense and exchange recorded against {account.name} keeps pointing at it under the new
          name.
        </DialogDescription>
      </DialogHeader>
      <RenameAccountForm account={account} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)

export default RenameAccountDialog
