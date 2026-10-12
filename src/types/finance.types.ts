import type { Currency } from "@/types/common.types";

export type AccountType =
    | "paypal"
    | "payoneer"
    | "stripe"
    | "wise"
    | "bank"
    | "cash"
    | "bkash"
    | "nagad"
    | "other";

export interface IAccount {
    id: string;
    name: string;
    type: AccountType;
    currency: Currency;
    opening_balance: number;
    /** Computed from the ledger — never a stored column. */
    balance: number;
    is_active: boolean;
    notes: string;
    created_at: string;
}

export interface IExchange {
    id: string;
    date: string;
    from_account_id: string;
    to_account_id: string;
    amount_usd: number;
    /** What the processor actually paid, not mid-market. */
    rate: number;
    fee_usd: number;
    amount_bdt: number;
    notes: string;
    from_account?: Pick<IAccount, "id" | "name" | "currency">;
    to_account?: Pick<IAccount, "id" | "name" | "currency">;
}

/** The ledger filter: what a movement did to the business. */
export const TRANSACTION_KINDS = ["income", "expense", "transfer"] as const;

export type TransactionKind = (typeof TRANSACTION_KINDS)[number];

/** What produced a ledger row. Mirrors the backend's LedgerSource. */
export type LedgerSource =
    | "opening_balance"
    | "payment"
    | "expense"
    | "team_payout"
    | "owner_withdrawal"
    | "exchange_out"
    | "exchange_in"
    | "due_received"
    | "due_payment"
    | "adjustment";

/**
 * One row of the ledger.
 *
 * Written by whatever caused it — a payment, an expense, an exchange — never
 * typed in directly. `amount` is signed: positive is money in.
 */
export interface ITransaction {
    id: string;
    date: string;
    amount: number;
    currency: Currency;
    source_type: LedgerSource;
    /** The record that produced it. Null only for a manual adjustment. */
    source_id: string | null;
    description: string;
    created_at: string;
    account: Pick<IAccount, "id" | "name" | "currency">;
}

export interface IRateSettings {
    default_usd_rate: number | null;
    /** What a new payment would actually use, right now. */
    effective_rate: number | null;
    effective_source: "api" | "manual";
    history: Array<{ id: string; date: string; rate: number; source: "api" | "manual"; provider: string }>;
}

export type LoanStatus = "active" | "settled" | "closed";

/**
 * A bank loan or EMI.
 *
 * Every figure here except `principal_bdt` is derived from the instalments by
 * the server, so no two of them can disagree. `outstanding_bdt` in particular
 * is never stored — it is the principal minus the principal of every paid
 * instalment.
 */
export interface ILoanInstalment {
    id: string;
    seq: number;
    due_date: string;
    principal_bdt: number;
    interest_bdt: number;
    /** Null means unpaid. This is the paid flag; there is no second boolean. */
    paid_at: string | null;
    notes: string;
    paid_from_account?: { id: string; name: string } | null;
}

export interface ILoan {
    id: string;
    lender: string;
    principal_bdt: number;
    interest_rate: number;
    started_on: string;
    term_months: number;
    status: LoanStatus;
    notes: string;
    account: { id: string; name: string; currency: string } | null;
    instalments: ILoanInstalment[];
    outstanding_bdt: number;
    principal_paid_bdt: number;
    /** The only part of borrowing that is a cost. */
    interest_paid_bdt: number;
    principal_scheduled_bdt: number;
    interest_scheduled_bdt: number;
    paid_count: number;
    instalment_count: number;
    next_due: { seq: number; due_date: string; total_bdt: number } | null;
}

export interface ILoanSummary {
    loan_count: number;
    active_count: number;
    borrowed_bdt: number;
    outstanding_bdt: number;
    interest_paid_bdt: number;
    principal_paid_bdt: number;
    next_due: Array<{ lender: string; seq: number; due_date: string; total_bdt: number }>;
}

/**
 * Somebody who owns part of the agency.
 *
 * `user_id` is optional both ways: an investor can own a share without ever
 * signing in, and most colleagues own none of it.
 */
export interface IShareholder {
    id: string;
    name: string;
    share_pct: number;
    is_active: boolean;
    notes: string;
    total_paid_bdt: number;
    user?: { id: string; full_name: string; email: string } | null;
}

/** Profit paid to an owner. Deliberately not an expense. */
export interface IShareholderDistribution {
    id: string;
    date: string;
    amount_bdt: number;
    notes: string;
    shareholder?: Pick<IShareholder, "id" | "name" | "share_pct">;
    account?: Pick<IAccount, "id" | "name" | "currency">;
}
