export type UserRole = "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF" | "ACCOUNTANT";

// The API sends roles lowercase (they are Prisma enum values). This is the
// single place the two spellings meet.
export type ApiUserRole = "super_admin" | "owner" | "manager" | "staff" | "accountant";

export const toUserRole = (role: ApiUserRole | string | undefined): UserRole | null => {
    if (!role) return null;
    const normalized = role.toUpperCase();
    const known: UserRole[] = ["SUPER_ADMIN", "OWNER", "MANAGER", "STAFF", "ACCOUNTANT"];
    return known.includes(normalized as UserRole) ? (normalized as UserRole) : null;
};

export interface IUser {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    role: ApiUserRole;
    status?: "pending" | "active" | "suspended";
    is_active: boolean;
    email_verified: boolean;
    permissions?: string[];
    created_at?: string;
    updated_at?: string;
}
