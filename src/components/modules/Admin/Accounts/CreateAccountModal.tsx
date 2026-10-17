"use client"

import { createAccountAction } from "@/app/(dashboardLayout)/admin/dashboard/accounts/_action"
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { accountFormZodSchema, type IAccountFormValues } from "@/zod/finance.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"

const defaultValues: IAccountFormValues = {
  name: "",
  type: "paypal",
  currency: "USD",
  opening_balance: "",
  notes: "",
}

// Grouped by currency in the picker, because choosing the wrong one is the
// mistake this form most needs to prevent — currency is fixed at creation.
const TYPES_BY_CURRENCY = {
  USD: [
    { value: "paypal", label: "PayPal" },
    { value: "payoneer", label: "Payoneer" },
    { value: "stripe", label: "Stripe" },
    { value: "wise", label: "Wise" },
    { value: "bank", label: "Bank" },
    { value: "other", label: "Other" },
  ],
  BDT: [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank" },
    { value: "bkash", label: "bKash" },
    { value: "nagad", label: "Nagad" },
    { value: "other", label: "Other" },
  ],
} as const

const CreateAccountModal = () => {
  const [open, setOpen] = useState(false)

  const { run: createAccount, isPending } = useActionMutation({
    action: createAccountAction,
    successMessage: "Account created successfully",
    invalidateKeys: [queryKeys.accounts.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await createAccount(value)) {
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
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          Add account
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,32rem)] lg:max-w-[min(88vw,32rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Add account</DialogTitle>
          <DialogDescription>
            A wallet holding one currency — PayPal and Payoneer for USD, bKash and Nagad for BDT.
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
              <form.Field name="name" validators={{ onChange: accountFormZodSchema.shape.name }}>
                {(field) => (
                  <AppField field={field} label="Name" placeholder="e.g. PayPal — main" disabled={isPending} />
                )}
              </form.Field>

              <form.Subscribe selector={(state) => state.values.currency}>
                {(currency) => (
                  <>
                    <form.Field name="currency">
                      {(field) => (
                        <div className="space-y-1.5">
                          <Label htmlFor={field.name}>Currency</Label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              const currency = value === "BDT" ? "BDT" : "USD"
                              field.handleChange(currency)
                              // A USD type left on a BDT wallet would be refused,
                              // so the type resets to the currency's first option.
                              form.setFieldValue("type", TYPES_BY_CURRENCY[currency][0].value)
                            }}
                            disabled={isPending}
                          >
                            <SelectTrigger id={field.name} className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD — what clients pay in</SelectItem>
                              <SelectItem value="BDT">BDT — what the agency spends in</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Fixed once saved: changing it would reinterpret every movement already
                            recorded against the account.
                          </p>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="type">
                      {(field) => (
                        <EntitySelect
                          id={field.name}
                          label="Type"
                          value={field.state.value}
                          onChange={field.handleChange}
                          disabled={isPending}
                          options={TYPES_BY_CURRENCY[currency]}
                        />
                      )}
                    </form.Field>
                  </>
                )}
              </form.Subscribe>

              <form.Field name="opening_balance">
                {(field) => (
                  <AppField
                    field={field}
                    label="Opening balance"
                    type="number"
                    placeholder="0"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
                  Add account
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAccountModal
