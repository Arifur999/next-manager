import type { IStatusRef } from "@/types/common.types";
import type { IClient } from "@/types/crm.types";

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
    /** Left out for operations, who deliver the work but are not told what the deal is worth. */
    contract_value_usd?: number;
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
