"use client"

import {
  createExpenseAction,
  createExpenseCategoryAction,
} from "@/app/(dashboardLayout)/admin/dashboard/expenses/_action"
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatBdt } from "@/lib/currency"
import { useActionMutation } from "@/hooks/useActionMutation"
import { expenseFormZodSchema, type IExpenseFormValues } from "@/zod/agencio.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { projectsListQuery } from "@/queries/project.queries"
import { accountsQuery } from "@/queries/finance.queries"
import { queryKeys } from "@/lib/queryKeys"
import { expenseCategoriesQuery } from "@/queries/spending.queries"

const today = () => new Date().toISOString().slice(0, 10)

const defaultValues: IExpenseFormValues = {
  date: today(),
  category_id: "",
  amount_bdt: "",
  account_id: "",
  project_id: "",
  vendor: "",
  notes: "",
}

const RecordExpenseModal = () => {
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const { data: categoriesData } = useQuery({ ...expenseCategoriesQuery(), enabled: open })
  const { data: accountsData } = useQuery({ ...accountsQuery(), enabled: open })
  const { data: projectsData } = useQuery({ ...projectsListQuery(), enabled: open })

  const categories = ((categoriesData?.data ?? [])).filter((c) => c.is_active)
  const accounts = accountsData?.data ?? []
  const projects = projectsData?.data ?? []

  // Expenses are BDT, so a USD wallet is never a valid source.
  const bdtAccounts = accounts.filter((account) => account.currency === "BDT" && account.is_active)

  const { run: recordExpense, isPending } = useActionMutation({
    action: createExpenseAction,
    successMessage: "Expense recorded",
    invalidateKeys: [
      queryKeys.expenses.all,
      queryKeys.accounts.all,
      queryKeys.transactions.all,
      queryKeys.dashboard.all,
    ],
  })

  // Adding a category inline: without it, the first expense of a new kind means
  // abandoning a half-filled form to go and create one somewhere else.
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

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // A failure keeps the dialog open with what was typed.
      if (await recordExpense(value)) {
        setOpen(false)
        form.reset()
      }
    },
  })

  const handleAddCategory = async () => {
    const name = newCategory.trim()
    if (!name) return

    if (await addCategory({ name, type: "general" })) setNewCategory("")
  }

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        form.reset()
        setNewCategory("")
      }
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Record expense
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Record expense</DialogTitle>
          <DialogDescription>Money out, always BDT.</DialogDescription>
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
              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="date">
                  {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="amount_bdt"
                  validators={{ onChange: expenseFormZodSchema.shape.amount_bdt }}
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
                name="category_id"
                validators={{ onChange: expenseFormZodSchema.shape.category_id }}
              >
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
                      error={
                        field.state.meta.isTouched && field.state.meta.errors.length > 0
                          ? "Choose a category"
                          : null
                      }
                    />

                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="Or add a new category"
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

              <form.Field
                name="account_id"
                validators={{ onChange: expenseFormZodSchema.shape.account_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Paid from"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Add a BDT account first"
                    description="Only BDT accounts — expenses cannot come out of a USD wallet."
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
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      hint: project.code,
                    }))}
                  />
                )}
              </form.Field>

              <form.Field name="vendor">
                {(field) => (
                  <AppField
                    field={field}
                    label="Vendor"
                    placeholder="e.g. Landlord"
                    disabled={isPending}
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
                  Record expense
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default RecordExpenseModal
