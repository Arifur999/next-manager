import { z } from "zod"
import { isoDate, optionalNonNegative, positiveAmount, toNumber } from "./formFields"

export const expenseFormZodSchema = z.object({
    date: isoDate,
    category_id: z.string().min(1, "Choose a category"),
    amount_bdt: positiveAmount("Amount"),
    account_id: z.string().min(1, "Choose a BDT account"),
    project_id: z.string().optional(),
    vendor: z.string().optional(),
    notes: z.string().optional(),
})

export type IExpenseFormValues = z.infer<typeof expenseFormZodSchema>

export const expenseCategoryFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["general", "employee"], { message: "Choose a type" }),
    monthly_budget: optionalNonNegative("Monthly budget"),
})

export type IExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormZodSchema>

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
