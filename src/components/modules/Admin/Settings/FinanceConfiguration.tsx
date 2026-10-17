"use client"

import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(dashboardLayout)/admin/dashboard/finance-config/_action"
import ExchangeRateSettings from "@/components/modules/Admin/Settings/ExchangeRateSettings"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBdt } from "@/lib/currency"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { expenseCategoriesQuery } from "@/queries/spending.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * The two settings that change what every money figure means.
 *
 * They were separate tabs, which hid the fact that they answer the same
 * question — how this agency counts money. The rate decides what a dollar is
 * worth in the reports; the categories decide what a cost is counted as.
 */

const CategorySettings = () => {
  const [name, setName] = useState("")
  const [type, setType] = useState<"general" | "employee">("general")

  const { data } = useQuery(expenseCategoriesQuery())

  const categories = data?.data ?? []

  const { run: addCategory, isPending: isCreating } = useActionMutation({
    action: createCategoryAction,
    successMessage: "Category added",
    invalidateKeys: [queryKeys.expenseCategories.all],
    refresh: false,
  })

  // The server refuses a category that expenses still use, and its message
  // ("deactivate it instead") is the failure toast.
  const { run: deleteCategory } = useActionMutation({
    action: deleteCategoryAction,
    successMessage: "Category deleted",
    invalidateKeys: [queryKeys.expenseCategories.all],
    refresh: false,
  })

  const handleCreate = async () => {
    if (!name.trim()) return
    if (await addCategory({ name, type })) setName("")
  }

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category name"
          className="min-w-0 flex-1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              void handleCreate()
            }
          }}
        />

        <Select value={type} onValueChange={(value) => setType(value as "general" | "employee")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isCreating || !name.trim()}
        >
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Employee-type categories are reported alongside team payouts rather than with
        operating expenses, so the same money is not counted twice.
      </p>

      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm">{category.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {category.type}
                  {category.monthly_budget ? ` · ${formatBdt(category.monthly_budget)} budget` : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void deleteCategory(category.id)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete {category.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const FinanceConfiguration = () => (
  <div className="space-y-6">
    <ExchangeRateSettings />

    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Expense categories</CardTitle>
        <p className="text-sm text-muted-foreground">
          What a cost gets counted as, and therefore which report it lands in.
        </p>
      </CardHeader>
      <CategorySettings />
    </Card>
  </div>
)

export default FinanceConfiguration
