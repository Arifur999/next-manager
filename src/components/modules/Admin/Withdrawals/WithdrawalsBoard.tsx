"use client"

import { createWithdrawalAction } from "@/app/(dashboardLayout)/admin/dashboard/withdrawals/_action"
import { withdrawalsColumns } from "@/components/modules/Admin/Withdrawals/withdrawalsColumns"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import StatTile from "@/components/shared/StatTile"
import DataTable from "@/components/shared/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { formatBdt } from "@/lib/currency"
import { getAccounts, getOwnerWithdrawals } from "@/services/agencio.services"
import type { IAccount, IOwnerWithdrawal } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PiggyBank, Plus, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const withdrawalFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  amount_bdt: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number.isFinite(Number(value)), "Amount must be a number")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  type: z.enum(["personal", "reinvestment"]),
  account_id: z.string().min(1, "Choose a BDT account"),
  notes: z.string().optional(),
})

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>

const today = () => new Date().toISOString().slice(0, 10)

const defaultValues: WithdrawalFormValues = {
  date: today(),
  amount_bdt: "",
  type: "personal",
  account_id: "",
  notes: "",
}

const RecordWithdrawalModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: open,
  })

  const accounts = (accountsData?.data ?? []) as IAccount[]
  const bdtAccounts = accounts.filter((account) => account.currency === "BDT" && account.is_active)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: WithdrawalFormValues) =>
      createWithdrawalAction({ ...values, amount_bdt: Number(values.amount_bdt) }),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to record withdrawal")
        return
      }

      toast.success(result.message || "Withdrawal recorded successfully")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["withdrawals"] })
      void queryClient.invalidateQueries({ queryKey: ["accounts"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      router.refresh()
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
                  validators={{ onChange: withdrawalFormSchema.shape.amount_bdt }}
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
                    onChange={(value) => field.handleChange(value as WithdrawalFormValues["type"])}
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
                validators={{ onChange: withdrawalFormSchema.shape.account_id }}
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

const WithdrawalsBoard = () => {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => getOwnerWithdrawals(),
    // The route is owner-only, so anyone else gets a 403. One retry is enough
    // to rule out a blip without hammering a wall that will not move.
    retry: 1,
  })

  const withdrawals = (data?.data ?? []) as IOwnerWithdrawal[]

  const personal = withdrawals
    .filter((row) => row.type === "personal")
    .reduce((running, row) => running + row.amount_bdt, 0)
  const reinvested = withdrawals
    .filter((row) => row.type === "reinvestment")
    .reduce((running, row) => running + row.amount_bdt, 0)

  // A 403 here is the role gate doing its job, not a bug — say so rather than
  // showing an empty table that looks like "no withdrawals".
  if (error) {
    return (
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">Owner only</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          What the owner takes out of the business is not visible to other roles, including admins.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Taken personally"
          value={formatBdt(personal)}
          hint="Profit already earned, leaving — never counted as a business cost"
          icon={<PiggyBank className="size-5" />}
          tone={5}
        />
        <StatTile
          label="Put back in"
          value={formatBdt(reinvested)}
          hint="Reinvested into the business"
          icon={<PiggyBank className="size-5" />}
          tone={3}
        />
      </div>

      <DataTable
        data={withdrawals}
        columns={withdrawalsColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No withdrawals recorded yet."
        toolbarAction={<RecordWithdrawalModal />}
      />
    </div>
  )
}

export default WithdrawalsBoard
