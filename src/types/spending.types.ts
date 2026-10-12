import type { IAccount } from "@/types/finance.types";
import type { IProject } from "@/types/project.types";

export type ExpenseCategoryType = "general" | "employee";

export type PayoutType = "salary" | "project_bonus" | "commission" | "reimbursement";

export type WithdrawalType = "personal" | "reinvestment";

export type DueDirection = "received" | "payment";

export interface IExpenseCategory {
    id: string;
    name: string;
    type: ExpenseCategoryType;
    color: string;
    monthly_budget: number | null;
    is_active: boolean;
}

export interface IExpense {
    id: string;
    date: string;
    category_id: string;
    amount_bdt: number;
    account_id: string;
    project_id: string | null;
    vendor: string;
    notes: string;
    receipt_url: string;
    category?: Pick<IExpenseCategory, "id" | "name" | "type" | "color">;
    account?: Pick<IAccount, "id" | "name" | "currency">;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
}

export interface ITeamPayout {
    id: string;
    date: string;
    user_id: string;
    project_id: string | null;
    amount_bdt: number;
    type: PayoutType;
    account_id: string;
    notes: string;
    user?: { id: string; full_name: string; email: string; avatar_url?: string };
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    account?: Pick<IAccount, "id" | "name" | "currency">;
}

export interface IOwnerWithdrawal {
    id: string;
    date: string;
    amount_bdt: number;
    type: WithdrawalType;
    account_id: string;
    notes: string;
    account?: Pick<IAccount, "id" | "name" | "currency">;
}

export interface IDuePerson {
    id: string;
    name: string;
    phone: string;
    notes: string;
    total_received_bdt: number;
    total_payment_bdt: number;
    /** Positive: the agency owes them. Negative: they owe the agency. */
    balance_bdt: number;
}

export interface IDueTransaction {
    id: string;
    due_person_id: string;
    date: string;
    direction: DueDirection;
    amount_bdt: number;
    account_id: string;
    notes: string;
    due_person?: Pick<IDuePerson, "id" | "name" | "phone">;
    account?: Pick<IAccount, "id" | "name" | "currency">;
}
