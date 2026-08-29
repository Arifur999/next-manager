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

/**
 * A platform operator.
 *
 * An **empty** `permissions` array means full access, not none — that is the
 * hatch in `requirePermission` that stops the first operator locking
 * themselves out. Every screen showing this has to say so, because the
 * opposite reading is the obvious one.
 */
export interface IPlatformAdmin {
    id: string;
    full_name: string;
    email: string;
    permissions: string[];
    status: "pending" | "active" | "suspended";
    created_at: string;
}

/** The token is absent on purpose: it is readable once, on the create. */
export interface IPlatformInvite {
    id: string;
    email: string;
    permissions: string[];
    expires_at: string;
    used_at: string | null;
    revoked_at: string | null;
    created_at: string;
}

export interface IPlatformActivity {
    id: string;
    entity_type: string;
    entity_id: string | null;
    action: string;
    summary: string;
    created_at: string;
    /** Null once the operator has been removed — the entry outlives them. */
    actor: { id: string; full_name: string; email: string } | null;
}

/**
 * What an operator may do, as the API names them.
 *
 * Kept in step with `platform.permissions.ts` on the server by hand. A
 * mismatch shows up immediately: the API refuses an unknown permission rather
 * than storing it, so a typo here fails loudly on the first save.
 */
export const PLATFORM_PERMISSIONS = [
    "platform.companies.view",
    "platform.companies.manage",
    "platform.plans.manage",
    "platform.finance.view",
    "platform.expenses.manage",
    "platform.admins.manage",
    "platform.campaigns.send",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

export const PLATFORM_PERMISSION_INFO: Record<
    PlatformPermission,
    { area: string; label: string; description: string }
> = {
    "platform.companies.view": {
        area: "Companies",
        label: "See customers",
        description: "Read the customer list, their plan and how much of it they use.",
    },
    "platform.companies.manage": {
        area: "Companies",
        label: "Create and change customers",
        description:
            "Provision a company, move it between plans, suspend or restore it. This is the one that can cut a paying customer off.",
    },
    "platform.plans.manage": {
        area: "Plans",
        label: "Edit plans",
        description: "Change prices and limits. A plan edit moves every company on that tier at once.",
    },
    "platform.finance.view": {
        area: "Finance",
        label: "See the numbers",
        description: "Revenue, churn and net profit for the platform itself.",
    },
    "platform.expenses.manage": {
        area: "Finance",
        label: "Record expenses",
        description: "Add and edit what the platform spends.",
    },
    "platform.admins.manage": {
        area: "Team",
        label: "Manage the platform team",
        description:
            "Invite operators and set what they may do — including granting this permission, so hand it out carefully.",
    },
    "platform.campaigns.send": {
        area: "Customers",
        label: "Send announcements",
        description: "Publish notices to customers, and email them.",
    },
};
