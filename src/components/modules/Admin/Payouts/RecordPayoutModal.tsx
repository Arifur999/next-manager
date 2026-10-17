"use client"

import { createTeamPayoutAction } from "@/app/(dashboardLayout)/admin/dashboard/payouts/_action"
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
import { formatBdt } from "@/lib/currency"
import { teamPayoutFormZodSchema, type ITeamPayoutFormValues } from "@/zod/spending.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { projectsListQuery } from "@/queries/project.queries"
import { accountsQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"
import { usersListQuery } from "@/queries/people.queries"
import { todayIsoDate } from "@/lib/dates"

const TYPES = [
  { value: "salary", label: "Salary" },
  { value: "project_bonus", label: "Project bonus" },
  { value: "commission", label: "Commission" },
  { value: "reimbursement", label: "Reimbursement" },
] as const

const getDefaultValues = (): ITeamPayoutFormValues => ({
  user_id: "",
  project_id: "",
  date: todayIsoDate(),
  amount_bdt: "",
  type: "salary",
  account_id: "",
  notes: "",
})

const RecordPayoutModal = () => {
  const [open, setOpen] = useState(false)

  const { data: usersData } = useQuery({ ...usersListQuery(), enabled: open })
  const { data: accountsData } = useQuery({ ...accountsQuery(), enabled: open })
  const { data: projectsData } = useQuery({ ...projectsListQuery(), enabled: open })

  const activeUsers = (usersData?.data ?? []).filter((user) => user.status === "active")
  const accounts = accountsData?.data ?? []
  const projects = projectsData?.data ?? []
  const bdtAccounts = accounts.filter((account) => account.currency === "BDT" && account.is_active)

  const { run: recordPayout, isPending } = useActionMutation({
    action: createTeamPayoutAction,
    successMessage: "Payout recorded successfully",
    invalidateKeys: [queryKeys.payouts.all, queryKeys.accounts.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await recordPayout(value)) {
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
          Record payout
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record payout</DialogTitle>
          <DialogDescription>
            What the agency pays its own people, in BDT.
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
              <form.Field name="user_id" validators={{ onChange: teamPayoutFormZodSchema.shape.user_id }}>
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Team member"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Invite a team member first"
                    options={activeUsers.map((user) => ({
                      value: user.id,
                      label: user.full_name,
                      hint: user.role.replace(/_/g, " "),
                    }))}
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a team member"
                        : null
                    }
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_bdt"
                  validators={{ onChange: teamPayoutFormZodSchema.shape.amount_bdt }}
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
                    onChange={(value) => field.handleChange(value as ITeamPayoutFormValues["type"])}
                    disabled={isPending}
                    options={TYPES.map((type) => ({ value: type.value, label: type.label }))}
                  />
                )}
              </form.Field>

              <form.Field name="project_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Project (optional)"
                    value={field.state.value ?? ""}
                    onChange={field.handleChange}
                    disabled={isPending}
                    placeholder="Not tied to a project"
                    emptyMessage="No projects yet"
                    description="Tie it to a project and it counts as that project's team cost."
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      hint: project.code,
                    }))}
                  />
                )}
              </form.Field>

              <form.Field
                name="account_id"
                validators={{ onChange: teamPayoutFormZodSchema.shape.account_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Paid from"
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
                  Record payout
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordPayoutModal
