import type { IChatPerson } from "@/types/agencio.types";
import type { IStatusRef, StatusCategory } from "@/types/common.types";
import type { IProject } from "@/types/project.types";

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

export type TaskPriority = "low" | "medium" | "high" | "urgent";

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
