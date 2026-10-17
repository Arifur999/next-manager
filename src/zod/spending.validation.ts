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
    name: z.string().trim().min(1, "Name is required"),
    type: z.enum(["general", "employee"], { message: "Choose a type" }),
    monthly_budget: optionalNonNegative("Monthly budget"),
})

export type IExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormZodSchema>

export const teamPayoutFormZodSchema = z.object({
    user_id: z.string().min(1, "Choose a team member"),
    project_id: z.string().optional(),
    date: isoDate,
    amount_bdt: positiveAmount("Amount"),
    type: z.enum(["salary", "project_bonus", "commission", "reimbursement"]),
    account_id: z.string().min(1, "Choose a BDT account"),
    notes: z.string().optional(),
})

export type ITeamPayoutFormValues = z.infer<typeof teamPayoutFormZodSchema>

export const ownerWithdrawalFormZodSchema = z.object({
    date: isoDate,
    amount_bdt: positiveAmount("Amount"),
    type: z.enum(["personal", "reinvestment"]),
    account_id: z.string().min(1, "Choose a BDT account"),
    notes: z.string().optional(),
})

export type IOwnerWithdrawalFormValues = z.infer<typeof ownerWithdrawalFormZodSchema>

export const duePersonFormZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
})

export type IDuePersonFormValues = z.infer<typeof duePersonFormZodSchema>

export const dueTransactionFormZodSchema = z.object({
    due_person_id: z.string().min(1, "Choose a person"),
    date: isoDate,
    direction: z.enum(["received", "payment"]),
    amount_bdt: positiveAmount("Amount"),
    account_id: z.string().min(1, "Choose a BDT account"),
    notes: z.string().optional(),
})

export type IDueTransactionFormValues = z.infer<typeof dueTransactionFormZodSchema>

// Server schemas: the form's string values, checked again on the server and
// turned into the payload the API's request schema expects.
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

export const createTeamPayoutServerZodSchema = teamPayoutFormZodSchema.transform((values) => ({
    user_id: values.user_id,
    project_id: values.project_id || null,
    date: values.date,
    amount_bdt: Number(values.amount_bdt),
    type: values.type,
    account_id: values.account_id,
    notes: values.notes,
}))

export const createOwnerWithdrawalServerZodSchema = ownerWithdrawalFormZodSchema.transform((values) => ({
    date: values.date,
    amount_bdt: Number(values.amount_bdt),
    type: values.type,
    account_id: values.account_id,
    notes: values.notes,
}))

export const createDuePersonServerZodSchema = duePersonFormZodSchema.transform((values) => ({
    name: values.name,
    phone: values.phone,
}))

export const createDueTransactionServerZodSchema = dueTransactionFormZodSchema.transform((values) => ({
    due_person_id: values.due_person_id,
    date: values.date,
    direction: values.direction,
    amount_bdt: Number(values.amount_bdt),
    account_id: values.account_id,
    notes: values.notes,
}))
