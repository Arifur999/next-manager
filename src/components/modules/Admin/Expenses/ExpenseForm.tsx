"use client"

import ExpenseCategoryField from "@/components/modules/Admin/Expenses/ExpenseCategoryField"
import { useExpenseForm } from "@/components/modules/Admin/Expenses/useExpenseForm"
import { useAccountOptions } from "@/components/modules/Admin/Money/useAccountOptions"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { projectsListQuery } from "@/queries/project.queries"
import type { IExpense } from "@/types/spending.types"
import { expenseFormZodSchema } from "@/zod/spending.validation"
import { useQuery } from "@tanstack/react-query"

type ExpenseFormProps = {
  /** Present to correct a recorded expense. */
  expense?: IExpense | null
  onDone: () => void
}

const ExpenseForm = ({ expense, onDone }: ExpenseFormProps) => {
  const { form, isPending } = useExpenseForm(expense, onDone)
  const { data: projectsData } = useQuery(projectsListQuery())
  // Expenses are BDT, so a USD wallet is never a valid source.
  const bdtAccounts = useAccountOptions("BDT", expense?.account_id)

  const projects = projectsData?.data ?? []

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
      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="amount_bdt" validators={{ onChange: expenseFormZodSchema.shape.amount_bdt }}>
          {(field) => (
            <AppField field={field} label="Amount (BDT)" type="number" placeholder="0.00" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <ExpenseCategoryField form={form} isPending={isPending} currentId={expense?.category_id} />

      <form.Field name="account_id" validators={{ onChange: expenseFormZodSchema.shape.account_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Paid from"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage={bdtAccounts.emptyMessage}
            description="Only BDT accounts — expenses cannot come out of a USD wallet."
            options={bdtAccounts.options}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a BDT account" : null}
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
            placeholder="General overhead"
            emptyMessage="No projects yet"
            description="Tie it to a project and profitability subtracts it there."
            options={projects.map((project) => ({ value: project.id, label: project.name, hint: project.code }))}
          />
        )}
      </form.Field>

      <form.Field name="vendor">
        {(field) => <AppField field={field} label="Vendor" placeholder="e.g. Landlord" disabled={isPending} />}
      </form.Field>

      <form.Field name="receipt_url" validators={{ onBlur: expenseFormZodSchema.shape.receipt_url }}>
        {(field) => (
          <AppField
            field={field}
            label="Receipt link (optional)"
            inputMode="url"
            autoComplete="url"
            placeholder="https://"
            disabled={isPending}
            description="Where the receipt is kept, such as a Drive or Dropbox link."
          />
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={expense ? "Saving..." : "Recording..."} className="w-auto">
          {expense ? "Save changes" : "Record expense"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default ExpenseForm
