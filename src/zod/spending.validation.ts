import { expenseCategoryFormZodSchema, expenseFormZodSchema, toNumber } from "@/zod/agencio.validation"

// Server schemas: the form's string values, checked again on the server and
// turned into the payload the API's createExpenseZodSchema expects.
export const createExpenseServerZodSchema = expenseFormZodSchema.transform((values) => ({
    date: values.date,
    category_id: values.category_id,
    amount_bdt: Number(values.amount_bdt),
    account_id: values.account_id,
    project_id: values.project_id || null,
    vendor: values.vendor,
    notes: values.notes,
}))

export const createExpenseCategoryServerZodSchema = expenseCategoryFormZodSchema.transform((values) => ({
    name: values.name,
    type: values.type,
    monthly_budget: toNumber(values.monthly_budget),
}))
