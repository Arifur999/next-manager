"use client"

import {
  createTeamPayoutAction,
  updateTeamPayoutAction,
} from "@/app/(dashboardLayout)/admin/dashboard/payouts/_action"
import { useAccountOptions } from "@/components/modules/Admin/Money/useAccountOptions"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import { sentenceCase } from "@/lib/text"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import { usersListQuery } from "@/queries/people.queries"
import { projectsListQuery } from "@/queries/project.queries"
import type { ITeamPayout } from "@/types/spending.types"
import { teamPayoutFormZodSchema, type ITeamPayoutFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

const TYPES = [
  { value: "salary", label: "Salary" },
  { value: "project_bonus", label: "Project bonus" },
  { value: "commission", label: "Commission" },
  { value: "reimbursement", label: "Reimbursement" },
] as const

const toFormValues = (payout?: ITeamPayout | null): ITeamPayoutFormValues => ({
  user_id: payout?.user_id ?? "",
  project_id: payout?.project_id ?? "",
  date: payout?.date ?? todayIsoDate(),
  amount_bdt: payout ? String(payout.amount_bdt) : "",
  type: payout?.type ?? "salary",
  account_id: payout?.account_id ?? "",
  notes: payout?.notes ?? "",
})

type PayoutFormProps = {
  /** Present to correct a recorded payout. */
  payout?: ITeamPayout | null
  onDone: () => void
}

const PayoutForm = ({ payout, onDone }: PayoutFormProps) => {
  const { data: usersData } = useQuery(usersListQuery())
  const { data: projectsData } = useQuery(projectsListQuery())
  const bdtAccounts = useAccountOptions("BDT", payout?.account_id)

  // Someone who has left still shows on a payout made while they were here.
  const members = (usersData?.data ?? []).filter((user) => user.status === "active" || user.id === payout?.user_id)
  const projects = projectsData?.data ?? []

  const { run: savePayout, isPending } = useActionMutation({
    action: (values: ITeamPayoutFormValues) =>
      payout ? updateTeamPayoutAction(payout.id, values) : createTeamPayoutAction(values),
    successMessage: payout ? "Payout updated" : "Payout recorded",
    invalidateKeys: [queryKeys.payouts.all, queryKeys.payroll.all, queryKeys.projectFinancials.all, ...ledgerQueryKeys],
  })

  const form = useForm({
    defaultValues: toFormValues(payout),
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await savePayout(value)) onDone()
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
      <form.Field name="user_id" validators={{ onChange: teamPayoutFormZodSchema.shape.user_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Team member"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage="Invite a team member first"
            options={members.map((user) => ({ value: user.id, label: user.full_name, hint: sentenceCase(user.role) }))}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a team member" : null}
          />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="amount_bdt" validators={{ onChange: teamPayoutFormZodSchema.shape.amount_bdt }}>
          {(field) => (
            <AppField field={field} label="Amount (BDT)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <form.Field name="type">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Type"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            options={TYPES}
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
            options={projects.map((project) => ({ value: project.id, label: project.name, hint: project.code }))}
          />
        )}
      </form.Field>

      <form.Field name="account_id" validators={{ onChange: teamPayoutFormZodSchema.shape.account_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Paid from"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={bdtAccounts.emptyMessage}
            options={bdtAccounts.options}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a BDT account" : null}
          />
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={payout ? "Saving..." : "Recording..."} className="w-auto">
          {payout ? "Save changes" : "Record payout"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default PayoutForm
