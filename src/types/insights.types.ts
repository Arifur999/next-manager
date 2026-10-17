import type { Currency } from "@/types/common.types";
import type { ITask } from "@/types/work.types";

export interface IDashboard {
    month: {
        revenue_usd: number;
        revenue_bdt_reporting: number;
        payment_count: number;
        expense_bdt: number;
    };
    balances: Array<{ accountId: string; name: string; currency: Currency; balance: number }>;
    balance_by_currency: Record<Currency, number>;
    outstanding_receivable_usd: number;
    active_projects: number;
    overdue_invoices: number;
    tasks_due_today: ITask[];
    recent_activity: Array<{
        id: string;
        entity_type: string;
        action: string;
        summary: string;
        created_at: string;
        user?: { id: string; full_name: string; avatar_url?: string } | null;
    }>;
}

export interface IProfitAndLoss {
    revenue: { usd: number; bdt_reporting: number; payment_count: number };
    cost: {
        operating_expense_bdt: number;
        employee_expense_bdt: number;
        team_payout_bdt: number;
        total_bdt: number;
    };
    net_profit_bdt: number;
    margin_pct: number;
}

export interface IMonthlyPoint {
    month: string;
    revenue_usd: number;
    revenue_bdt_reporting: number;
    cost_bdt: number;
    profit_bdt: number;
}

/** Money received from one client: payments, not invoices. */
export interface IClientRevenue {
    client: { id: string; name: string; company: string } | null;
    revenue_usd: number;
    revenue_bdt_reporting: number;
    payment_count: number;
}

/** Money received minus money spent on one project. */
export interface IProjectProfitability {
    project: { id: string; name: string; code: string };
    contract_value_usd: number;
    received_usd: number;
    received_bdt_reporting: number;
    expense_bdt: number;
    team_payout_bdt: number;
    total_cost_bdt: number;
    profit_bdt: number;
    margin_pct: number;
}

/** The ledger summed by what caused each movement, per currency. */
export interface ICashFlow {
    by_source: Array<{ source: string; currency: Currency; amount: number }>;
    totals: Record<Currency, { in: number; out: number; net: number }>;
    transfer_sources: string[];
}

export const KPI_METRICS = [
    "utilization_pct",
    "realization_pct",
    "billable_hours",
    "revenue_usd",
    "gross_margin_pct",
    "deals_won",
    "deal_value_usd",
    "win_rate_pct",
    "pipeline_coverage",
    "on_time_delivery_pct",
    "project_margin_pct",
] as const;

export type KpiMetric = (typeof KPI_METRICS)[number];

export const KPI_PERIODS = ["month", "quarter", "year"] as const;

export type KpiPeriod = (typeof KPI_PERIODS)[number];

export interface IKpiTarget {
    id: string;
    /** Null means the target belongs to the whole agency, not to one person. */
    user_id: string | null;
    metric: KpiMetric;
    period: KpiPeriod;
    period_start: string;
    target_value: number;
    notes: string;
    user?: { id: string; full_name: string; email: string };
}
