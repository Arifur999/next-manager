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
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
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
    source: string;
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
    id: string;
    client_id: string;
    name: string;
    code: string;
    description: string;
    status: ProjectStatus;
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
    status: TaskStatus;
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
