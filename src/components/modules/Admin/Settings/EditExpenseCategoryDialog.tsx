"use client"

import { updateCategoryAction } from "@/app/(dashboardLayout)/admin/dashboard/finance-config/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import type { IExpenseCategory } from "@/types/spending.types"
import {
  expenseCategoryEditFormZodSchema,
  type IExpenseCategoryEditFormValues,
} from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"

const CATEGORY_TYPES = [
  { value: "general", label: "General", hint: "Reported as an operating cost" },
  { value: "employee", label: "Employee", hint: "Reported with team payouts" },
] as const

const EditCategoryForm = ({ category, onDone }: { category: IExpenseCategory; onDone: () => void }) => {
  const { run: saveCategory, isPending } = useActionMutation({
    action: (values: IExpenseCategoryEditFormValues) => updateCategoryAction(category.id, values),
    successMessage: "Category updated",
    // Expenses carry their category's name and type, and the reports group by it.
    invalidateKeys: [queryKeys.expenseCategories.all, queryKeys.expenses.all, queryKeys.reportPl.all],
    refresh: false,
  })

  const defaultValues: IExpenseCategoryEditFormValues = {
    name: category.name,
    type: category.type,
    monthly_budget: category.monthly_budget ? String(category.monthly_budget) : "",
    is_active: category.is_active,
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (await saveCategory(value)) onDone()
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
      <form.Field name="name" validators={{ onChange: expenseCategoryEditFormZodSchema.shape.name }}>
        {(field) => <AppField field={field} label="Name" autoComplete="off" disabled={isPending} />}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Counted as"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            description="Changing it moves every expense in this category to the other report line."
            options={CATEGORY_TYPES}
          />
        )}
      </form.Field>

      <form.Field
        name="monthly_budget"
        validators={{ onChange: expenseCategoryEditFormZodSchema.shape.monthly_budget }}
      >
        {(field) => (
          <AppField
            field={field}
            label="Monthly budget (BDT, optional)"
            type="number"
            placeholder="0"
            disabled={isPending}
          />
        )}
      </form.Field>

      <form.Field name="is_active">
        {(field) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="category-active"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked === true)}
              disabled={isPending}
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="category-active">Offered when recording an expense</Label>
              <p className="text-xs text-muted-foreground">
                Switch off to retire it. Expenses already in it keep it.
              </p>
            </div>
          </div>
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
          Save changes
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

type EditExpenseCategoryDialogProps = {
  category: IExpenseCategory | null
  onOpenChange: (open: boolean) => void
}

const EditExpenseCategoryDialog = ({ category, onOpenChange }: EditExpenseCategoryDialogProps) => (
  <Dialog open={category !== null} onOpenChange={onOpenChange}>
    <DialogContent onInteractOutside={(event) => event.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Edit category</DialogTitle>
        <DialogDescription>What a cost gets counted as, and so which report it lands in.</DialogDescription>
      </DialogHeader>
      {category && <EditCategoryForm key={category.id} category={category} onDone={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>
)

export default EditExpenseCategoryDialog
