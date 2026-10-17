"use client"

import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(dashboardLayout)/admin/dashboard/finance-config/_action"
import EditExpenseCategoryDialog from "@/components/modules/Admin/Settings/EditExpenseCategoryDialog"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { formatBdt } from "@/lib/currency"
import { sentenceCase } from "@/lib/text"
import { queryKeys } from "@/lib/queryKeys"
import { expenseCategoriesQuery } from "@/queries/spending.queries"
import { useQuery } from "@tanstack/react-query"
import type { IExpenseCategory } from "@/types/spending.types"
import { Pencil, Tags, Trash2 } from "lucide-react"
import { useState } from "react"
import { expenseCategoryFormZodSchema, type IExpenseCategoryFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"

const defaultValues: IExpenseCategoryFormValues = { name: "", type: "general" }

const CATEGORY_TYPES = [
  { value: "general", label: "General" },
  { value: "employee", label: "Employee" },
] as const

const ExpenseCategorySettings = () => {
  const [categoryToDelete, setCategoryToDelete] = useState<IExpenseCategory | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<IExpenseCategory | null>(null)

  const categoriesQuery = useQuery(expenseCategoriesQuery())

  const categories = categoriesQuery.data?.data ?? []

  const { run: addCategory, isPending: isCreating } = useActionMutation({
    action: createCategoryAction,
    successMessage: "Category added",
    invalidateKeys: [queryKeys.expenseCategories.all],
    refresh: false,
  })

  // The server refuses a category that expenses still use, and its message
  // ("deactivate it instead") is the failure toast.
  const { run: deleteCategory, isPending: isDeleting } = useActionMutation({
    action: deleteCategoryAction,
    successMessage: "Category deleted",
    invalidateKeys: [queryKeys.expenseCategories.all],
    refresh: false,
  })

  const handleConfirmDelete = async () => {
    if (categoryToDelete && (await deleteCategory(categoryToDelete.id))) setCategoryToDelete(null)
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: expenseCategoryFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // The type stays as chosen: categories tend to be added in runs of one kind.
      if (await addCategory(value)) {
        formApi.reset({ ...value, name: "" }, { keepDefaultValues: true })
      }
    },
  })

  return (
    <div className="space-y-5 px-5 py-5">
      <form
        method="POST"
        action="#"
        noValidate
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => (
            <Input
              name={field.name}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
              placeholder="New category name"
              aria-label="New category name"
              className="min-w-0 flex-1"
            />
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                const type = CATEGORY_TYPES.find((option) => option.value === value)
                if (type) field.handleChange(type.value)
              }}
            >
              <SelectTrigger className="w-40" aria-label="Category type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => !state.values.name.trim()}>
          {(isNameBlank) => (
            <Button type="submit" disabled={isCreating || isNameBlank}>
              Add
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-xs text-muted-foreground">
        Employee-type categories are reported alongside team payouts rather than with
        operating expenses, so the same money is not counted twice.
      </p>

      <PanelState
        query={categoriesQuery}
        errorMessage="Categories did not load."
        isEmpty={categories.length === 0}
        empty={
          <EmptyState icon={Tags} hint="Add the kinds of cost the agency pays for, such as rent or software.">
            No categories yet.
          </EmptyState>
        }
      >
        <ul className="divide-y rounded-lg border">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="truncate">{category.name}</span>
                  {!category.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Retired
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sentenceCase(category.type)}
                  {category.monthly_budget ? ` · ${formatBdt(category.monthly_budget)} budget` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center">
                <Button type="button" variant="ghost" size="icon" onClick={() => setCategoryToEdit(category)}>
                  <Pencil className="size-4" aria-hidden="true" />
                  <span className="sr-only">Edit {category.name}</span>
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setCategoryToDelete(category)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">Delete {category.name}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </PanelState>

      <EditExpenseCategoryDialog
        category={categoryToEdit}
        onOpenChange={(open) => {
          if (!open) setCategoryToEdit(null)
        }}
      />

      <ConfirmDialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
        title="Delete this category?"
        description={
          <>
            This removes <span className="font-medium text-foreground">{categoryToDelete?.name}</span>. A
            category with expenses recorded against it cannot be deleted — edit it and switch it off
            instead, so those expenses keep their category.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isDeleting}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}

export default ExpenseCategorySettings
