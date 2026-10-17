"use client"

import {
  createExpenseAction,
  updateExpenseAction,
} from "@/app/(dashboardLayout)/admin/dashboard/expenses/_action"
import { useActionMutation } from "@/hooks/useActionMutation"
import { todayIsoDate } from "@/lib/dates"
import { queryKeys } from "@/lib/queryKeys"
import { ledgerQueryKeys } from "@/queries/finance.queries"
import type { IExpense } from "@/types/spending.types"
import type { IExpenseFormValues } from "@/zod/spending.validation"
import { useForm } from "@tanstack/react-form"

const toFormValues = (expense?: IExpense | null): IExpenseFormValues => ({
  date: expense?.date ?? todayIsoDate(),
  category_id: expense?.category_id ?? "",
  amount_bdt: expense ? String(expense.amount_bdt) : "",
  account_id: expense?.account_id ?? "",
  project_id: expense?.project_id ?? "",
  vendor: expense?.vendor ?? "",
  notes: expense?.notes ?? "",
  receipt_url: expense?.receipt_url ?? "",
})

// The expense form and its save, for recording and for correcting. A failure
// keeps the form open with what was typed.
export const useExpenseForm = (expense: IExpense | null | undefined, onDone: () => void) => {
  const { run: saveExpense, isPending } = useActionMutation({
    action: (values: IExpenseFormValues) =>
      expense ? updateExpenseAction(expense.id, values) : createExpenseAction(values),
    successMessage: expense ? "Expense updated" : "Expense recorded",
    invalidateKeys: [queryKeys.expenses.all, queryKeys.projectFinancials.all, ...ledgerQueryKeys],
  })

  const form = useForm({
    defaultValues: toFormValues(expense),
    onSubmit: async ({ value }) => {
      if (await saveExpense(value)) onDone()
    },
  })

  return { form, isPending }
}

// What the expense's field groups take as their form.
export type ExpenseFormApi = ReturnType<typeof useExpenseForm>["form"]
