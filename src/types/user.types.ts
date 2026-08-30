// Roles live in one place: lib/authUtils.ts, spelled exactly as the API sends
// them. This file used to declare a second, upper-cased set and a translator
// between the two - and the two drifted, ending up with STAFF and ACCOUNTANT
// that the server had never heard of. Re-exporting removes the seam.
export type { UserRole } from "@/lib/authUtils";
export { isUserRole, ALL_ROLES } from "@/lib/authUtils";

import type { UserRole } from "@/lib/authUtils";
import { isUserRole } from "@/lib/authUtils";

/**
 * A role off the wire, or null when it is not one we know.
 *
 * No case conversion any more - the API value IS the value. It stays a
 * function rather than a cast because a token minted before a role was renamed
 * can still carry the old string, and that has to read as "unknown" rather
 * than crash a layout.
 */
export const toUserRole = (role: string | undefined | null): UserRole | null =>
    isUserRole(role) ? role : null;

export interface IUser {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    role: UserRole;
    /**
     * Whether this person may sign in, and why not when they may not.
     *
     * Replaces `is_active`, which this type used to declare ALONGSIDE an
     * optional `status` the API never sent. The backend now has one field and
     * so does this.
     */
    status: "pending" | "active" | "suspended";
    email_verified: boolean;
    permissions?: string[];
    /**
     * Which part of the business they are in — a second axis to role.
     *
     * Null is a real answer, not a missing one: somebody can work here without
     * belonging to a department, and the API sends the name alongside the id so
     * a list of people never has to fetch the department list to render a word.
     */
    department?: { id: string; name: string } | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * What a colleague may do WITHIN their role.
 *
 * Kept in step with `companyPermissions.ts` on the server by hand. A mismatch
 * shows up immediately: the API refuses an unknown permission rather than
 * storing it, so a typo here fails loudly on the first save.
 */
export const COMPANY_PERMISSIONS = [
    "clients.manage",
    "leads.manage",
    "invoices.manage",
    "projects.manage",
    "tasks.manage",
    "time.approve",
    "vault.reveal",
] as const;

export type CompanyPermission = (typeof COMPANY_PERMISSIONS)[number];

export const COMPANY_PERMISSION_INFO: Record<
    CompanyPermission,
    { area: string; label: string; description: string }
> = {
    "clients.manage": {
        area: "Clients",
        label: "Add and edit clients",
        description: "Create a client and change its details. Deleting one stays with admin.",
    },
    "leads.manage": {
        area: "Sales",
        label: "Work the pipeline",
        description: "Add leads, move them between stages, and convert a won one into a client.",
    },
    "invoices.manage": {
        area: "Sales",
        label: "Raise invoices",
        description: "Create and edit invoices. This is what a client is asked to pay.",
    },
    "projects.manage": {
        area: "Delivery",
        label: "Run projects",
        description: "Create projects, change their details, and set who is on them.",
    },
    "tasks.manage": {
        area: "Delivery",
        label: "Create and assign tasks",
        description:
            "Hand work to somebody. Moving your own task along does not need this — everybody can do that.",
    },
    "time.approve": {
        area: "Delivery",
        label: "Approve hours",
        description:
            "Sign off other people's timesheets. Approved hours are what utilisation and realisation are computed from.",
    },
    "vault.reveal": {
        area: "Vault",
        label: "Reveal stored passwords",
        description:
            "See a client credential in the clear. Every reveal is recorded against the person who did it.",
    },
};
