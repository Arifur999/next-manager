"use client"

import { createExchangeAction } from "@/app/(dashboardLayout)/admin/dashboard/exchange/_action"
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
import { formatBdt, formatRate, formatUsd } from "@/lib/currency"
import { getAccounts, getRateSettings } from "@/services/agencio.services"
import type { IAccount, IRateSettings } from "@/types/agencio.types"
import {
  exchangeFormFields,
  exchangeFormZodSchema,
  toNumber,
  type IExchangeFormValues,
} from "@/zod/agencio.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeftRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"

const today = () => new Date().toISOString().slice(0, 10)

const defaultValues: IExchangeFormValues = {
  date: today(),
  from_account_id: "",
  to_account_id: "",
  amount_usd: "",
  rate: "",
  fee_usd: "",
  notes: "",
}

const RecordExchangeModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: open,
  })
  const { data: rateData } = useQuery({
    queryKey: ["rate-settings"],
    queryFn: () => getRateSettings(),
    enabled: open,
  })

  const accounts = (accountsData?.data ?? []) as IAccount[]
  const rates = rateData?.data as IRateSettings | undefined

  const usdAccounts = accounts.filter((a) => a.currency === "USD" && a.is_active)
  const bdtAccounts = accounts.filter((a) => a.currency === "BDT" && a.is_active)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IExchangeFormValues) =>
      createExchangeAction({
        ...values,
        amount_usd: toNumber(values.amount_usd),
        rate: toNumber(values.rate),
        fee_usd: toNumber(values.fee_usd) ?? 0,
      }),
  })

  const form = useForm({
    defaultValues,
    validators: {
      // The fee-vs-amount rule spans two fields, so it lives on the form rather
      // than on either one of them.
      onSubmit: exchangeFormZodSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        // The server refuses an overdraw and says how much is actually there —
        // that message is more useful than anything this form could invent.
        toast.error(result.message || "Failed to record exchange")
        return
      }

      toast.success(result.message || "Exchange recorded successfully")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["exchanges"] })
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
          <ArrowLeftRight className="size-4" />
          Record exchange
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record exchange</DialogTitle>
          <DialogDescription>
            Moving USD into BDT. This is the only place BDT comes into existence.
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
              <form.Field name="date">
                {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
              </form.Field>

              <form.Field name="from_account_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="From (USD)"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a USD account first"
                    options={usdAccounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      hint: formatUsd(account.balance),
                    }))}
                  />
                )}
              </form.Field>

              <form.Field name="to_account_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="To (BDT)"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a BDT account first"
                    options={bdtAccounts.map((account) => ({
                      value: account.id,
                      label: account.name,
                      hint: formatBdt(account.balance),
                    }))}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field
                  name="amount_usd"
                  validators={{ onChange: exchangeFormFields.shape.amount_usd }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Amount sent (USD)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>

                <form.Field name="fee_usd">
                  {(field) => (
                    <AppField
                      field={field}
                      label="Processor fee (USD)"
                      type="number"
                      placeholder="0.00"
                      disabled={isPending}
                    />
                  )}
                </form.Field>
              </div>

              <form.Field
                name="rate"
                validators={{ onChange: exchangeFormFields.shape.rate }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <AppField
                      field={field}
                      label="Rate you actually got"
                      type="number"
                      placeholder="e.g. 117.40"
                      disabled={isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Not pre-filled on purpose.
                      {rates?.effective_rate
                        ? ` Today's market rate is ${formatRate(rates.effective_rate)}, but PayPal and Payoneer pay less than that — type what actually landed.`
                        : " Type what actually landed, not the market rate — processors pay less."}
                    </p>
                  </div>
                )}
              </form.Field>

              {/* What will actually reach the BDT wallet, worked out the same
                  way the server does it: (amount - fee) * rate. */}
              <form.Subscribe
                selector={(state) =>
                  [state.values.amount_usd, state.values.fee_usd, state.values.rate] as const
                }
              >
                {([amount, fee, rate]) => {
                  const net = Number(amount || 0) - Number(fee || 0)
                  const bdt = net * Number(rate || 0)
                  if (!bdt || net <= 0) return null
                  return (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                      {formatUsd(Number(amount))} leaves the USD wallet and{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatBdt(bdt)}
                      </span>{" "}
                      lands in BDT.
                    </p>
                  )
                }}
              </form.Subscribe>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Recording..." className="w-auto">
                  Record exchange
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordExchangeModal
