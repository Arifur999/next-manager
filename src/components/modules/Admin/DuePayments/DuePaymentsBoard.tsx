"use client"

import {
  createDuePersonAction,
  createDueTransactionAction,
} from "@/app/(dashboardLayout)/admin/dashboard/due-payments/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import StatTile from "@/components/shared/StatTile"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  getAccounts,
  getDuePeople,
  getDueTransactions,
} from "@/services/agencio.services"
import type { IAccount, IDuePerson, IDueTransaction } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight, Plus, Scale, UserPlus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Informal lending, in and out.
 *
 * The sign convention is the thing to get right on screen: a POSITIVE balance
 * means the agency has taken more from that person than it has given back, so
 * the agency owes THEM. Showing a bare signed number would leave every reader
 * working that out from scratch, so each row says which way it points.
 */

const transactionSchema = z.object({
  due_person_id: z.string().min(1, "Choose a person"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  direction: z.enum(["received", "payment"]),
  amount_bdt: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => Number.isFinite(Number(value)), "Amount must be a number")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero"),
  account_id: z.string().min(1, "Choose a BDT account"),
  notes: z.string().optional(),
})

type TransactionValues = z.infer<typeof transactionSchema>

const today = () => new Date().toISOString().slice(0, 10)

const AddPersonModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: { name: string; phone?: string }) => createDuePersonAction(values),
  })

  const form = useForm({
    defaultValues: { name: "", phone: "" },
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to add person")
        return
      }

      toast.success("Person added")
      setOpen(false)
      form.reset()
      void queryClient.invalidateQueries({ queryKey: ["due-people"] })
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="shrink-0">
          <UserPlus className="size-4" />
          Add person
        </Button>
      </DialogTrigger>

      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add person</DialogTitle>
          <DialogDescription>
            Someone the agency lends to or borrows from. Kept apart from clients and team members,
            because this balance is personal.
          </DialogDescription>
        </DialogHeader>

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
          <form.Field name="name" validators={{ onChange: z.string().min(1, "Name is required") }}>
            {(field) => <AppField field={field} label="Name" disabled={isPending} />}
          </form.Field>

          <form.Field name="phone">
            {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
          </form.Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
              Add person
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const RecordTransactionModal = ({ people }: { people: IDuePerson[] }) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    enabled: open,
  })

  const bdtAccounts = ((accountsData?.data ?? []) as IAccount[]).filter(
    (account) => account.currency === "BDT" && account.is_active,
  )

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: TransactionValues) =>
      createDueTransactionAction({ ...values, amount_bdt: Number(values.amount_bdt) }),
  })

  // Annotated rather than `satisfies`: the latter narrows `direction` to the
  // literal "received", so the form field could never be switched to "payment".
  const defaultValues: TransactionValues = {
    due_person_id: "",
    date: today(),
    direction: "received",
    amount_bdt: "",
    account_id: "",
    notes: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to record transaction")
        return
      }

      toast.success("Transaction recorded")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["due-people"] })
      void queryClient.invalidateQueries({ queryKey: ["due-transactions"] })
      void queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          Record transaction
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record transaction</DialogTitle>
          <DialogDescription>
            From the agency&apos;s point of view: received is money in, payment is money out.
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
              <form.Field
                name="due_person_id"
                validators={{ onChange: transactionSchema.shape.due_person_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Person"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a person first"
                    options={people.map((person) => ({
                      value: person.id,
                      label: person.name,
                      hint: person.phone || undefined,
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a person"
                        : null
                    }
                  />
                )}
              </form.Field>

              <form.Field name="direction">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Direction"
                    value={field.state.value}
                    onChange={(value) =>
                      field.handleChange(value as TransactionValues["direction"])
                    }
                    disabled={isPending}
                    options={[
                      { value: "received", label: "Received", hint: "Money came in" },
                      { value: "payment", label: "Payment", hint: "Money went out" },
                    ]}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_bdt"
                  validators={{ onChange: transactionSchema.shape.amount_bdt }}
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

              <form.Field
                name="account_id"
                validators={{ onChange: transactionSchema.shape.account_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Account"
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
                  Record
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const DuePaymentsBoard = () => {
  const { data: peopleData, isLoading } = useQuery({
    queryKey: ["due-people"],
    queryFn: () => getDuePeople(),
  })
  const { data: transactionsData } = useQuery({
    queryKey: ["due-transactions"],
    queryFn: () => getDueTransactions(),
  })

  const people = (peopleData?.data ?? []) as IDuePerson[]
  const transactions = (transactionsData?.data ?? []) as IDueTransaction[]

  const owedByAgency = people
    .filter((person) => person.balance_bdt > 0)
    .reduce((running, person) => running + person.balance_bdt, 0)
  const owedToAgency = people
    .filter((person) => person.balance_bdt < 0)
    .reduce((running, person) => running + Math.abs(person.balance_bdt), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="The agency owes"
            value={formatBdt(owedByAgency)}
            hint="Taken from people and not yet given back"
            icon={<ArrowUpRight className="size-5" />}
            tone={4}
          />
          <StatTile
            label="Owed to the agency"
            value={formatBdt(owedToAgency)}
            hint="Given out and not yet returned"
            icon={<ArrowDownLeft className="size-5" />}
            tone={3}
          />
        </div>

        <div className="flex gap-2">
          <AddPersonModal />
          <RecordTransactionModal people={people} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Balance per person</CardTitle>
          </CardHeader>

          {isLoading && people.length === 0 ? (
            <div className="h-40 animate-pulse bg-muted/40" />
          ) : people.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-5 py-12 text-center text-sm text-muted-foreground">
              <Scale className="size-7" aria-hidden="true" />
              Nobody added yet.
            </p>
          ) : (
            <ul className="divide-y">
              {people.map((person) => {
                const owesAgency = person.balance_bdt < 0
                const settled = person.balance_bdt === 0

                return (
                  <li
                    key={person.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatBdt(person.total_received_bdt)} in ·{" "}
                        {formatBdt(person.total_payment_bdt)} out
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums">
                        {formatBdt(Math.abs(person.balance_bdt))}
                      </p>
                      {/* Which way it points, in words — a signed number alone
                          makes every reader work the convention out again. */}
                      <p className="text-xs text-muted-foreground">
                        {settled ? "settled" : owesAgency ? "they owe you" : "you owe them"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Recent transactions</CardTitle>
          </CardHeader>

          {transactions.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Nothing recorded yet.
            </p>
          ) : (
            <ul className="divide-y">
              {transactions.slice(0, 12).map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{transaction.due_person?.name ?? "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                      {transaction.account ? ` · ${transaction.account.name}` : ""}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-medium tabular-nums ${
                      transaction.direction === "received" ? "text-chart-3" : "text-chart-2"
                    }`}
                  >
                    {transaction.direction === "received" ? "+" : "−"}
                    {formatBdt(transaction.amount_bdt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DuePaymentsBoard
