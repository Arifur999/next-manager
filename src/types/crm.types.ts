import type { IProject } from "@/types/project.types";

export const CLIENT_STATUSES = ["active", "inactive", "archived"] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

/** In pipeline order. The last two end a deal rather than hold one. */
export const LEAD_STAGES = ["new", "contacted", "proposal", "negotiating", "won", "lost"] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

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

/** GET /clients/:id: the client with its live projects, newest first. */
export interface IClientDetail extends IClient {
    projects: IProject[];
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
