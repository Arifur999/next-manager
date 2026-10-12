// Domain types, mirroring what the API actually sends.
//
// The API is snake_case throughout (they are Prisma column names) and money
// arrives as plain numbers — sendResponse serialises Decimal to number and a
// @db.Date column to "YYYY-MM-DD" — so nothing here needs a transform layer.

import type { Currency } from "@/types/common.types";
import type { IClient } from "@/types/crm.types";
import type { IProject } from "@/types/project.types";
import type { ITask } from "@/types/work.types";

export interface IOrganization {
    id: string;
    name: string;
    legal_name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    logo_url: string;
    base_currency: Currency;
    default_usd_rate: number | null;
    timezone: string;
}

export interface ICredential {
    id: string;
    client_id: string | null;
    project_id: string | null;
    label: string;
    url: string;
    username: string;
    /** Always the mask on a list. The real value comes only from /reveal. */
    password: string;
    client?: Pick<IClient, "id" | "name"> | null;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    created_at: string;
}

export interface IRevealedCredential {
    id: string;
    label: string;
    username: string;
    password: string;
    notes: string;
}

export interface ICredentialAccessEntry {
    id: string;
    action: "created" | "updated" | "viewed" | "revealed" | "deleted";
    ip: string;
    user_agent: string;
    created_at: string;
    user?: { id: string; full_name: string; email: string };
}

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

export type KpiMetric =
    | "utilization_pct"
    | "realization_pct"
    | "billable_hours"
    | "revenue_usd"
    | "gross_margin_pct"
    | "deals_won"
    | "deal_value_usd"
    | "win_rate_pct"
    | "pipeline_coverage"
    | "on_time_delivery_pct"
    | "project_margin_pct";

export type KpiPeriod = "month" | "quarter" | "year";

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

/**
 * One entry in the audit trail.
 *
 * `summary` is the sentence written at the time of the action and never
 * recomputed, which is why the feed still reads correctly after the thing it
 * describes has been renamed or deleted.
 *
 * `user` can be null: removing somebody sets their activity rows to null
 * rather than deleting the history they left behind.
 */
export interface IActivityEntry {
    id: string;
    entity_type: string;
    entity_id: string | null;
    action: string;
    summary: string;
    created_at: string;
    user?: { id: string; full_name: string; email: string; avatar_url?: string } | null;
}

export interface IActivityFilters {
    entity_types: Array<{ value: string; count: number }>;
    actions: Array<{ value: string; count: number }>;
}

/** Things this app notifies about. Mirrors the backend's NotificationEvent. */
export type NotificationEventName =
    | "task_assigned"
    | "time_awaiting_approval"
    | "payment_recorded"
    | "member_awaiting_approval"
    | "invoice_overdue";

/**
 * One row of the notification settings.
 *
 * `roles` is the EFFECTIVE audience, not the stored one: an agency that has
 * never touched a rule has no row, and showing an empty picker for it would
 * read as "nobody is told", which is the opposite of the truth. `customised`
 * says whether anybody has changed it.
 *
 * `kind` decides whether a role picker is offered at all — a directed event
 * goes to the person it concerns, and a picker there would do nothing.
 */
export interface INotificationRule {
    event: NotificationEventName;
    kind: "directed" | "broadcast";
    label: string;
    description: string;
    in_app: boolean;
    email: boolean;
    roles: string[];
    customised: boolean;
}

/**
 * One sign-in attempt.
 *
 * `user` is null when the account has since been removed — the attempt
 * outlives the person, which is the point of keeping it. The address is
 * always there, so a row is never anonymous.
 *
 * Attempts at addresses with no account are not in this list at all: they
 * belong to no company, and never reach a company's screen.
 */
export interface ILoginEvent {
    id: string;
    email: string;
    success: boolean;
    ip: string;
    user_agent: string;
    created_at: string;
    user: { id: string; full_name: string; role: string } | null;
}

export type ConversationType = "direct" | "group" | "project";

export interface IChatPerson {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
}

/**
 * One conversation, as the list screen needs it.
 *
 * `name` is resolved by the server: a direct conversation has no stored name
 * because it is named after whoever you are talking to, which is a different
 * name for each of the two people in it.
 */
export interface IConversation {
    id: string;
    type: ConversationType;
    name: string;
    project: { id: string; name: string; code: string } | null;
    members: IChatPerson[];
    last_message: {
        id: string;
        body: string;
        created_at: string;
        sender: { id: string; full_name: string } | null;
    } | null;
    last_message_at: string;
    archived_at: string | null;
    unread_count: number;
}

export interface IMessage {
    id: string;
    conversation_id: string;
    body: string;
    created_at: string;
    sender: IChatPerson | null;
}
