// Domain types, mirroring what the API actually sends.
//
// The API is snake_case throughout (they are Prisma column names) and money
// arrives as plain numbers — sendResponse serialises Decimal to number and a
// @db.Date column to "YYYY-MM-DD" — so nothing here needs a transform layer.

export type Currency = "USD" | "BDT";

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

export type ClientStatus = "active" | "inactive" | "archived";
export type LeadStage = "new" | "contacted" | "proposal" | "negotiating" | "won" | "lost";
/**
 * What a status MEANS, as opposed to what an agency calls it.
 *
 * The name is theirs to change; this is what the product reasons about. A
 * board column called "Shipped" or "Client approved" is `done` either way,
 * and that is what stops the clock.
 */
export type StatusCategory = "open" | "active" | "blocked" | "done" | "cancelled";

/** One column on a board. */
export interface IWorkflowStatus {
    id: string;
    kind: "task" | "project";
    name: string;
    category: StatusCategory;
    /** Board order, left to right. A sequence, not alphabetical. */
    sort_order: number;
    /** What new work lands on. One per board. */
    is_default: boolean;
    is_active: boolean;
    /** How much is on it — what makes deleting one refusable. */
    _count?: { tasks: number; projects: number };
}

/** The status as it travels on a task or project row. */
export interface IStatusRef {
    id: string;
    name: string;
    category: StatusCategory;
    sort_order: number;
}
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type InvoiceStatus =
    | "draft"
    | "sent"
    | "partially_paid"
    | "paid"
    | "overdue"
    | "cancelled";
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

export interface IClient {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
    status: ClientStatus;
    notes: string;
    created_at: string;
}

export interface IClientFinancials {
    lifetime_value_usd: number;
    lifetime_value_bdt_reporting: number;
    total_invoiced_usd: number;
    outstanding_usd: number;
    payment_count: number;
    project_count: number;
    client_since: string;
}

export interface ILead {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    /** Null when nobody said where it came from - not the same as "Direct". */
    source_id: string | null;
    source?: { id: string; name: string } | null;
    stage: LeadStage;
    estimated_value_usd: number;
    notes: string;
    converted_client_id: string | null;
    converted_at: string | null;
}

export interface ILeadPipeline {
    stages: Array<{ stage: LeadStage; leads: ILead[]; count: number; value_usd: number }>;
    total: number;
    open_value_usd: number;
    open_count: number;
}

export interface IProject {
    /**
     * The plan, frozen at kickoff. contract_value_usd moves as the deal
     * changes; these do not, and the gap between them is the scope-change rate.
     * baseline_set_at is null when no baseline was ever taken - which is not
     * the same as one taken at zero.
     */
    baseline_hours?: number;
    baseline_value_usd?: number;
    baseline_set_at?: string | null;
    id: string;
    client_id: string;
    name: string;
    code: string;
    description: string;
    status: IStatusRef;
    start_date: string | null;
    end_date: string | null;
    contract_value_usd: number;
    notes: string;
    client?: Pick<IClient, "id" | "name" | "company">;
    _count?: { tasks: number; members: number };
}

export interface IProjectFinancials {
    contract_value_usd: number;
    invoiced_usd: number;
    received_usd: number;
    outstanding_usd: number;
    received_bdt: number;
    team_cost_bdt: number;
    expense_bdt: number;
    total_cost_bdt: number;
    profit_bdt: number;
}

export interface ITask {
    id: string;
    project_id: string;
    title: string;
    description: string;
    assignee_id: string | null;
    status: IStatusRef;
    priority: TaskPriority;
    due_date: string | null;
    completed_at: string | null;
    project?: Pick<IProject, "id" | "name" | "code">;
    assignee?: { id: string; full_name: string; avatar_url?: string } | null;
}

export interface IPayment {
    id: string;
    client_id: string;
    project_id: string | null;
    invoice_id: string | null;
    date: string;
    amount_usd: number;
    /** Frozen when the payment was saved — not today's rate. */
    reporting_rate: number;
    amount_bdt_reporting: number;
    account_id: string;
    reference: string;
    notes: string;
    client?: Pick<IClient, "id" | "name" | "company">;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    account?: Pick<IAccount, "id" | "name" | "currency">;
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

export interface IInvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    sort_order: number;
}

export interface IInvoice {
    id: string;
    client_id: string;
    project_id: string | null;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    status: InvoiceStatus;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes: string;
    terms: string;
    /** Derived on read from due_date, never stored. */
    is_overdue: boolean;
    paid_usd?: number;
    due_usd?: number;
    client?: Pick<IClient, "id" | "name" | "company" | "email">;
    project?: Pick<IProject, "id" | "name" | "code"> | null;
    items?: IInvoiceItem[];
    payments?: Array<Pick<IPayment, "id" | "date" | "amount_usd" | "reference">>;
    _count?: { items: number; payments: number };
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

export interface IRateSettings {
    default_usd_rate: number | null;
    /** What a new payment would actually use, right now. */
    effective_rate: number | null;
    effective_source: "api" | "manual";
    history: Array<{ id: string; date: string; rate: number; source: "api" | "manual"; provider: string }>;
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

export interface IProjectMember {
    id: string;
    role_on_project: string;
    created_at?: string;
    user: { id: string; full_name: string; email: string; avatar_url?: string; role: string };
}

export interface IAssignmentRow {
    user: { id: string; full_name: string; email: string; avatar_url?: string; role: string };
    assignments: Array<{
        id: string;
        role_on_project: string;
        project: { id: string; name: string; code: string; status: IStatusRef };
    }>;
    /** Live work only — finished projects would make everyone look busy forever. */
    active_count: number;
}

export interface ITimeEntry {
    id: string;
    user_id: string;
    project_id: string;
    task_id: string | null;
    date: string;
    hours: number;
    is_billable: boolean;
    notes: string;
    /** Null until a second person signs it off. Only approved time is billable. */
    approved_at: string | null;
    approved_by: string | null;
    user?: { id: string; full_name: string; email: string; avatar_url?: string };
    project?: Pick<IProject, "id" | "name" | "code">;
    task?: { id: string; title: string } | null;
}

export interface ITimeSummary {
    days: Array<{ date: string; is_billable: boolean; hours: number }>;
    billable_hours: number;
    non_billable_hours: number;
    total_hours: number;
}

export interface ICapacityRow {
    user: { id: string; full_name: string; email: string; role: string };
    /** The denominator every utilization figure divides by. */
    weekly_hours: number;
    /** Zero means unset - realization is reported as uncomputable, not as zero. */
    standard_rate_usd: number;
    is_default: boolean;
}

/**
 * A dated promise inside a project.
 *
 * `submitted_at` is what on-time delivery is scored on — it is the part the
 * team controls. `accepted_at` is the client's sign-off; a milestone submitted
 * on time and never accepted is delivered but not done, which is worth being
 * able to see separately.
 */
export interface IMilestone {
    id: string;
    project_id: string;
    title: string;
    description: string;
    due_date: string;
    submitted_at: string | null;
    accepted_at: string | null;
    sort_order: number;
    created_at: string;
    project?: Pick<IProject, "id" | "name" | "code">;
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

/** Every stage a lead has been in. `from_stage` is null on the creation event. */
export interface ILeadStageEvent {
    id: string;
    lead_id: string;
    from_stage: string | null;
    to_stage: string;
    changed_by: string | null;
    changed_at: string;
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
 * A marketplace or channel a company lands work through.
 *
 * Curated per company rather than fixed — agencies use different ones. The
 * lead count comes back on the list so the screen can say why a source cannot
 * be deleted before somebody tries.
 */
export interface ILeadSource {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    _count?: { leads: number };
}

/** A pointer to where a client's work actually lives. */
export interface IClientLink {
    id: string;
    client_id: string;
    label: string;
    url: string;
    notes: string;
    created_at: string;
    client?: { id: string; name: string };
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

/**
 * One person's week, as both readings of it.
 *
 * `remaining_hours` is available minus logged — the same subtraction the
 * Workload and Availability screens show from opposite ends, so they cannot
 * disagree. `is_default` says the capacity behind it is an assumption nobody
 * entered rather than a decision somebody made.
 */
export interface IWorkloadRow {
    user: IChatPerson & { department?: { id: string; name: string } | null };
    weekly_hours: number;
    is_default: boolean;
    available_hours: number;
    logged_hours: number;
    remaining_hours: number;
    utilization_pct: number | null;
    leave_days: number;
}

export interface IWorkload {
    rows: IWorkloadRow[];
    from: string;
    to: string;
    days: number;
}

/**
 * The task board, counted.
 *
 * Done and overdue are decided by status CATEGORY on the server, never by a
 * name — an agency that renames Done to Shipped keeps a correct report.
 */
export interface ITaskReport {
    total: number;
    overdue_count: number;
    done_count: number;
    unassigned_count: number;
    by_status: Array<{ status: IWorkflowStatus | null; count: number }>;
    by_assignee: Array<{
        user: IChatPerson | null;
        total: number;
        done: number;
        overdue: number;
    }>;
}

/** The same shape as IClientLink: a project and a client keep material alike. */
export interface IProjectLink {
    id: string;
    project_id: string;
    label: string;
    url: string;
    notes: string;
    created_at: string;
    project?: { id: string; name: string; code: string };
}
