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
