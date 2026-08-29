/**
 * Plans and subscriptions — what the platform charges a company.
 *
 * Distinct from IInvoice and friends, which are what a company charges its own
 * clients. The two point in opposite directions and sharing a name for them
 * would make every screen ambiguous.
 */

export type SubscriptionStatus =
    | "trialing"
    | "active"
    /** Period ended, inside the grace window — still writing. */
    | "past_due"
    /** No writing, by the platform's decision. */
    | "suspended"
    /** No writing, by the company's. */
    | "cancelled";

export interface IPlan {
    id: string;
    code: string;
    name: string;
    description: string;
    price_usd: number;
    /** Null is unlimited, which is not the same as zero. */
    max_seats: number | null;
    max_projects: number | null;
    features: string[];
    is_active: boolean;
    sort_order: number;
}

export interface ISubscription {
    id: string;
    organization_id: string;
    plan_id: string;
    status: SubscriptionStatus;
    trial_ends_at: string | null;
    current_period_end: string | null;
    cancelled_at: string | null;
    notes: string;
    plan: IPlan;
}

export interface IUsage {
    seats_used: number;
    projects_used: number;
    seats_limit: number | null;
    projects_limit: number | null;
}

export interface ICompanyRow {
    id: string;
    name: string;
    email: string;
    created_at: string;
    subscription: ISubscription | null;
    usage: IUsage;
}

export interface IMySubscription {
    subscription: ISubscription | null;
    usage: IUsage;
}

/**
 * The operator's own numbers.
 *
 * `unprovisioned` is companies with no subscription row at all — the
 * platform's own loose end, kept out of the status counts because it is not a
 * state a company chose.
 */
export interface IPlatformOverview {
    companies: {
        total: number;
        unprovisioned: number;
        trialing: number;
        active: number;
        past_due: number;
        suspended: number;
        cancelled: number;
    };
    /** Counts active and past_due. Money owed is still money owed. */
    mrr_usd: number;
    ending_soon: Array<{
        organization: { id: string; name: string; email: string };
        plan: string;
        status: SubscriptionStatus;
        ends_at: string | null;
    }>;
    newest: Array<{
        id: string;
        name: string;
        created_at: string;
        status: SubscriptionStatus | null;
        plan: string | null;
        seats: number;
    }>;
}
