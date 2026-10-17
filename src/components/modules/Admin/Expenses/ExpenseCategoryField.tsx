"use client"

import { createExpenseCategoryAction } from "@/app/(dashboardLayout)/admin/dashboard/expenses/_action"
import type { ExpenseFormApi } from "@/components/modules/Admin/Expenses/useExpenseForm"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { expenseCategoriesQuery } from "@/queries/spending.queries"
import { expenseFormZodSchema } from "@/zod/spending.validation"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

type ExpenseCategoryFieldProps = {
  form: ExpenseFormApi
  isPending: boolean
  /** The category of the expense being edited, listed even if retired since. */
  currentId?: string
}

// The category picker, with a way to add one inline: without it, the first
// expense of a new kind means abandoning a half-filled form.
const ExpenseCategoryField = ({ form, isPending, currentId }: ExpenseCategoryFieldProps) => {
  const [newCategory, setNewCategory] = useState("")
  const { data: categoriesData } = useQuery(expenseCategoriesQuery())
  const categories = (categoriesData?.data ?? []).filter(
    (category) => category.is_active || category.id === currentId,
  )

  const { run: addCategory, isPending: isAddingCategory } = useActionMutation({
    action: createExpenseCategoryAction,
    successMessage: "Category added",
    invalidateKeys: [queryKeys.expenseCategories.all],
    refresh: false,
    // Select the new category, so the user does not have to find it in the list.
    onSuccess: (result) => {
      if (result.success) form.setFieldValue("category_id", result.data.id)
    },
  })

  const handleAddCategory = async () => {
    const name = newCategory.trim()
    if (!name) return
    if (await addCategory({ name, type: "general" })) setNewCategory("")
  }

  return (
    <form.Field name="category_id" validators={{ onChange: expenseFormZodSchema.shape.category_id }}>
      {(field) => (
        <div className="space-y-2">
          <EntitySelect
            id={field.name}
            label="Category"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage="Add your first category below"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
              hint: category.type === "employee" ? "employee cost" : undefined,
            }))}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a category" : null}
          />

          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="Or add a new category"
              aria-label="New category name"
              disabled={isPending || isAddingCategory}
              onKeyDown={(event) => {
                // Enter here must not submit the whole expense form.
                if (event.key === "Enter") {
                  event.preventDefault()
                  void handleAddCategory()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleAddCategory()}
              disabled={isPending || isAddingCategory || !newCategory.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </form.Field>
  )
}

export default ExpenseCategoryField
