// Domain types, mirroring what the API actually sends.
//
// The API is snake_case throughout (they are Prisma column names) and money
// arrives as plain numbers — sendResponse serialises Decimal to number and a
// @db.Date column to "YYYY-MM-DD" — so nothing here needs a transform layer.

import type { Currency } from "@/types/common.types";
import type { IClient } from "@/types/crm.types";
import type { IProject } from "@/types/project.types";
import type { ITask } from "@/types/work.types";
import type { IAccount } from "@/types/finance.types";

export type ExpenseCategoryType = "general" | "employee";
export type PayoutType = "salary" | "project_bonus" | "commission" | "reimbursement";
export type WithdrawalType = "personal" | "reinvestment";
export type DueDirection = "received" | "payment";

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

/**
 * An invitation to join as an operations member.
 *
 * The token is deliberately absent: the API returns it exactly once, on the
 * response that creates the invite, and never again. There is nothing to model
 * here because there is nothing to read back.
 */
export interface ITeamInvite {
    id: string;
    email: string;
    role: string;
    expires_at: string;
    used_at: string | null;
    revoked_at: string | null;
    created_at: string;
}

/** What the join page is allowed to know before anybody has signed in. */
export interface IInvitePreview {
    email: string;
    organization_name: string;
}

/**
 * A team inside the agency.
 *
 * `_count.members` counts people who are still here — a department is not
 * "large" because six people who left were once in it.
 */
export interface IDepartment {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    _count?: { members: number };
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

/** A grouping for what the agency sells. */
export interface IServiceCategory {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    _count?: { services: number };
}

/**
 * Something the agency sells.
 *
 * `default_price_usd` is a starting point, not the price — every invoice line
 * keeps its own, so editing this never restates an invoice already sent. Zero
 * means "type it each time", which is a real way to sell rather than a missing
 * value.
 */
export interface IService {
    id: string;
    name: string;
    description: string;
    default_price_usd: number;
    is_active: boolean;
    sort_order: number;
    category: { id: string; name: string } | null;
    /** What is riding on it — what makes deleting one refusable. */
    _count?: { invoice_items: number; projects: number; template_items: number };
}

/**
 * A named bundle, so a repeat offer is one pick rather than five.
 *
 * Carries no price of its own on purpose: what it costs is the sum of what its
 * lines are actually sold at, and a stored total would be a second answer to
 * what the client owes.
 */
export interface IServiceTemplate {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    items: Array<{
        id: string;
        quantity: number;
        sort_order: number;
        service: { id: string; name: string; default_price_usd: number; is_active: boolean };
    }>;
}

/**
 * What each service has been billed.
 *
 * Billed, not collected: a payment settles a whole invoice rather than a line,
 * so attributing part of one to a service would mean inventing an allocation.
 * A row with an empty service id is the lines somebody typed by hand.
 */
export interface IServiceRevenue {
    service: { id: string; name: string };
    billed_usd: number;
    line_count: number;
}

/** A day somebody was at work. Null check_out means still in, not missing. */
export interface IAttendance {
    id: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    /** Whether they clocked in, or somebody wrote it down for them. */
    source: "self" | "admin";
    notes: string;
    user: { id: string; full_name: string; avatar_url?: string };
}

/** A kind of leave. `days_per_year` of zero means tracked but not capped. */
export interface ILeaveType {
    id: string;
    name: string;
    days_per_year: number;
    is_paid: boolean;
    is_active: boolean;
    _count?: { requests: number };
}

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ILeaveRequest {
    id: string;
    from_date: string;
    to_date: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    decided_at: string | null;
    decision_note: string;
    user: { id: string; full_name: string; avatar_url?: string };
    leave_type: { id: string; name: string; is_paid: boolean };
}

/**
 * What is left of an allowance this year.
 *
 * `remaining` is null for an uncapped type — "tracked but not capped" and "you
 * have none left" are opposite answers and must not both render as zero.
 */
export interface ILeaveBalance {
    leave_type: { id: string; name: string; is_paid: boolean };
    days_per_year: number;
    days_taken: number;
    remaining: number | null;
}

/**
 * One month's payroll.
 *
 * An item's `payout_id` being null is what "not paid yet" means — there is no
 * separate flag, so nothing can drift out of step with the money.
 */
export interface IPayrollRun {
    id: string;
    period_start: string;
    period_end: string;
    status: "draft" | "completed";
    notes: string;
    completed_at: string | null;
    account: { id: string; name: string; currency: string } | null;
    items: Array<{
        id: string;
        gross_bdt: number;
        deductions_bdt: number;
        net_bdt: number;
        notes: string;
        payout_id: string | null;
        user: { id: string; full_name: string; avatar_url?: string; role: string };
    }>;
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

/**
 * One service, with where it is actually being sold.
 *
 * No money on it on purpose: which clients bought a service is a sales fact,
 * what it earned is an income one, and that lives on the admin's revenue
 * report.
 */
export interface IServiceDetail extends IService {
    projects: Array<{
        id: string;
        name: string;
        code: string;
        status: { id: string; name: string; category: string } | null;
        client: { id: string; name: string; company: string } | null;
    }>;
    clients: Array<{ id: string; name: string; company: string }>;
}
