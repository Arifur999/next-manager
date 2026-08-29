/**
 * The shapes the KPI engine returns.
 *
 * The one that matters is `Attainment`. Every field on it can be null, and
 * each null means something different:
 *
 *   - `value: null`          the metric could not be computed. `reason` says why.
 *   - `target: null`         nobody set a target for this period.
 *   - `on_track: null`       unknown — NOT off track. A screen that paints this
 *                            red is lying about a number it does not have.
 *
 * Collapsing any of these to zero is the failure this whole type exists to
 * prevent: 0% utilization and "you joined this morning" are different answers.
 */

export type Metric = {
    value: number | null;
    reason?: string;
};

export type Attainment = {
    value: number | null;
    target: number | null;
    attainment_pct: number | null;
    on_track: boolean | null;
    reason?: string;
};

export type KpiScope = "agency" | "sales" | "delivery" | "me";

type ScopeMeta = {
    scope: KpiScope;
    from: string;
    to: string;
    days: number;
};

export type AgencyKpi = ScopeMeta & {
    leading: {
        utilization_pct: Attainment;
        realization_pct: Attainment;
        effective_hourly_rate_usd: Metric;
    };
    lagging: {
        revenue_usd: Attainment;
        gross_margin_pct: Attainment;
        net_profit_bdt: number;
        revenue_per_person_usd: Metric;
        annualised_revenue_per_person_usd: Metric;
    };
    context: {
        headcount: number;
        available_hours: number;
        logged_hours: number;
        billable_hours: number;
        approved_billable_hours: number;
        blended_rate_usd: number;
        /** How much of the denominator is an assumption rather than a decision. */
        people_on_default_capacity: number;
        people_with_a_bill_rate: number;
        revenue_bdt_reporting: number;
        cost_bdt: number;
    };
};

export type SalesKpi = ScopeMeta & {
    leading: {
        pipeline_coverage: Attainment;
        pipeline_velocity_usd_per_day: Metric;
    };
    lagging: {
        win_rate_pct: Attainment;
        deals_won: Attainment;
        deal_value_usd: Attainment;
        average_deal_size_usd: Metric;
        sales_cycle_days: Metric;
    };
    /**
     * Where the work came from, over the whole history rather than the window.
     *
     * A marketplace's win rate across one month is three deals, which is
     * noise. Leads nobody tagged appear as "Not recorded" rather than being
     * dropped - hiding them makes the percentages add up while being computed
     * from a subset.
     */
    by_source: Array<{
        name: string;
        won: number;
        lost: number;
        open: number;
        won_value_usd: number;
        /** Null where nothing has been decided yet - not 0%. */
        win_rate_pct: number | null;
    }>;
    context: {
        open_deals: number;
        open_pipeline_usd: number;
        deals_lost: number;
        /** How few deals the cycle length was averaged over. */
        cycles_measured: number;
    };
};

export type DeliveryProjectRow = {
    id: string;
    name: string;
    code: string;
    plan_vs_actual_pct: Metric;
    scope_change_pct: Metric;
    margin_pct: Metric;
    actual_hours: number;
    baseline_hours: number;
};

export type DeliveryKpi = ScopeMeta & {
    leading: {
        free_capacity_hours: number;
        overdue_milestones: number;
        utilization_pct: Attainment;
    };
    lagging: {
        on_time_delivery_pct: Attainment;
        milestones_delivered: number;
        milestones_on_time: number;
        awaiting_acceptance: number;
    };
    projects: DeliveryProjectRow[];
    context: {
        available_hours: number;
        logged_hours: number;
        baselined_projects: number;
    };
};

export type MeKpi = ScopeMeta & {
    leading: {
        utilization_pct: Attainment;
        billable_hours: Attainment;
    };
    lagging: {
        on_time_delivery_pct: Attainment;
        open_tasks: number;
    };
    context: {
        available_hours: number;
        logged_hours: number;
        billable_hours: number;
        approved_billable_hours: number;
        milestones_delivered: number;
    };
};
