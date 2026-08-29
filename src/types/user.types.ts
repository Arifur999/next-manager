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
    created_at?: string;
    updated_at?: string;
}
