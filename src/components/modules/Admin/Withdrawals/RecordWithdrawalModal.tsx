"use client"

import { createWithdrawalAction } from "@/app/(dashboardLayout)/admin/dashboard/withdrawals/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatBdt } from "@/lib/currency"
import { queryKeys } from "@/lib/queryKeys"
import { accountsQuery } from "@/queries/finance.queries"
import { ownerWithdrawalFormZodSchema, type IOwnerWithdrawalFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { todayIsoDate } from "@/lib/dates"

const getDefaultValues = (): IOwnerWithdrawalFormValues => ({
  date: todayIsoDate(),
  amount_bdt: "",
  type: "personal",
  account_id: "",
  notes: "",
})

const RecordWithdrawalModal = () => {
  const [open, setOpen] = useState(false)

  const { data: accountsData } = useQuery({ ...accountsQuery(), enabled: open })

  const accounts = accountsData?.data ?? []
  const bdtAccounts = accounts.filter((account) => account.currency === "BDT" && account.is_active)

  const { run: recordWithdrawal, isPending } = useActionMutation({
    action: createWithdrawalAction,
    successMessage: "Withdrawal recorded successfully",
    invalidateKeys: [queryKeys.withdrawals.all, queryKeys.accounts.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await recordWithdrawal(value)) {
        setOpen(false)
        form.reset()
      }
    },
  })

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record withdrawal
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,32rem)] lg:max-w-[min(88vw,32rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record withdrawal</DialogTitle>
          <DialogDescription>
            Money you take out of the business. Not a business expense — reports keep it out of
            cost, so profit is not understated by the amount taken.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
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
              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_bdt"
                  validators={{ onChange: ownerWithdrawalFormZodSchema.shape.amount_bdt }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Amount (BDT)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              </div>

              <form.Field name="type">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Type"
                    value={field.state.value}
                    onChange={(value) => field.handleChange(value as IOwnerWithdrawalFormValues["type"])}
                    disabled={isPending}
                    description="Reinvestment goes back into the business; personal does not."
                    options={[
                      { value: "personal", label: "Personal" },
                      { value: "reinvestment", label: "Reinvestment" },
                    ]}
                  />
                )}
              </form.Field>

              <form.Field
                name="account_id"
                validators={{ onChange: ownerWithdrawalFormZodSchema.shape.account_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Taken from"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a BDT account first"
                    options={bdtAccounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      hint: formatBdt(account.balance),
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a BDT account"
                        : null
                    }
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Recording..." className="w-auto">
                  Record withdrawal
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordWithdrawalModal
