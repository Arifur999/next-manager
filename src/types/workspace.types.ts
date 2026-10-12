import type { Currency } from "@/types/common.types";
import type { IClient } from "@/types/crm.types";
import type { IProject } from "@/types/project.types";

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
