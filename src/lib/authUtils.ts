/**
 * Route ownership, as data.
 *
 * The rule that shapes this file: a route's required roles are declared once
 * here and resolved by one function. Never scatter `if (role !== "admin")`
 * through pages — a rule that lives in two places is a rule that will
 * eventually disagree with itself.
 *
 * These strings are the API's own values, not an upper-cased translation of
 * them. The previous version mapped to `SUPER_ADMIN | OWNER | MANAGER | STAFF |
 * ACCOUNTANT` while the server said `super_admin | owner | admin | manager |
 * member` — two of those did not exist server-side at all. It never broke only
 * because everything collapsed into two buckets before it was used. Matching
 * the wire format exactly removes the whole class of bug.
 */
export type UserRole = "super_admin" | "admin" | "sales" | "project_manager" | "operations";

export const ALL_ROLES: UserRole[] = [
    "super_admin",
    "admin",
    "sales",
    "project_manager",
    "operations",
];

export const isUserRole = (value: unknown): value is UserRole =>
    typeof value === "string" && (ALL_ROLES as string[]).includes(value);

export const authRoles = ["/login", "/register", "/forgot-password", "/reset-password"];

export const isAuthRoute = (pathname: string) => authRoles.some((route) => route === pathname);

/**
 * A protected area and the roles allowed into it.
 *
 * `roles: null` means "any signed-in user" — used for the pages everyone has,
 * like their own profile.
 */
export type AreaRule = {
    pattern: RegExp[];
    exact: string[];
    roles: UserRole[] | null;
};

const matches = (pathname: string, rule: Pick<AreaRule, "exact" | "pattern">) =>
    rule.exact.includes(pathname) || rule.pattern.some((p) => p.test(pathname));

/**
 * Ordered, most specific first. The first rule that matches wins, so a nested
 * area can sit inside a broader one without the broader one swallowing it.
 */
export const AREAS: AreaRule[] = [
    // Everyone signed in.
    { exact: ["/my-profile", "/change-password"], pattern: [], roles: null },

    // Platform. Only ever the super admin.
    // The boundary matters. Written as /^\/platform/ this also matched
    // /platform-join/<token> — the public page somebody opens to accept an
    // invite, before they have any account — and sent them to sign in, which
    // they cannot do. A prefix rule with no boundary claims every route that
    // merely starts with the same letters.
    { exact: [], pattern: [/^\/platform(\/|$)/], roles: ["super_admin"] },

    // Money and company state.
    {
        exact: [],
        pattern: [
            /^\/admin\/dashboard\/(accounts|payments|exchange|expenses|payouts|withdrawals|due-payments|reports|transactions)/,
            // Configuration. "settings" was one page and is now several;
            // the /^\/admin/ catch-all below would cover them anyway, but
            // naming them says they are admin-only on purpose rather than
            // by omission.
            /^\/admin\/dashboard\/(business|finance-config|departments|services|workflow|permissions|notifications|security)/,
        ],
        roles: ["admin"],
    },

    // Selling: the pipeline and what gets billed for it.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(leads|invoices|sales)/],
        roles: ["admin", "sales"],
    },

    // Delivery: who does what, and when.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(projects|tasks|team-management|time-approvals|delivery)/],
        roles: ["admin", "project_manager"],
    },

    // Shared workspace screens.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(clients|vault)/],
        roles: ["admin", "sales", "project_manager"],
    },

    // The admin landing page, and anything under /admin that no rule above
    // claimed. Without this last clause a new page added to /admin/dashboard
    // matches nothing, and a path matching nothing is treated as public — the
    // one failure mode here that fails open, and one lint will never catch.
    { exact: [], pattern: [/^\/admin/], roles: ["admin"] },

    // Everything else under /dashboard is the personal area — a person's own
    // hours, tasks and timesheet.
    //
    // Not `roles: null`, which would let the super admin in: they belong to no
    // company, so every figure on those screens is computed against an empty
    // organization and renders as a confident wall of zeros. Their own area is
    // /platform. Profile and password stay open to them through the rule at
    // the top of this list.
    {
        exact: [],
        pattern: [/^\/dashboard/],
        roles: ["admin", "sales", "project_manager", "operations"],
    },
];

/** The rule guarding a path, or null when the path is public. */
export const getAreaRule = (pathname: string): AreaRule | null =>
    AREAS.find((area) => matches(pathname, area)) ?? null;

export const canRoleReach = (pathname: string, role: UserRole): boolean => {
    const area = getAreaRule(pathname);
    if (!area) return true; // public
    if (area.roles === null) return true; // any signed-in user
    return area.roles.includes(role);
};

/**
 * Where a role lands after signing in.
 *
 * Each company role gets its own home rather than the two buckets the previous
 * version collapsed to — a salesperson dropped on the finance dashboard sees
 * nothing they can act on and several things they cannot open.
 */
export const getDefaultDashboardRoute = (role: UserRole): string => {
    switch (role) {
        case "super_admin":
            return "/platform";
        case "admin":
            return "/admin/dashboard";
        case "sales":
            return "/admin/dashboard/sales";
        case "project_manager":
            return "/admin/dashboard/delivery";
        case "operations":
            return "/dashboard";
    }
};

/**
 * Whether a `?redirect=` is worth honouring for this role.
 *
 * Without this, signing in from a deep link would bounce: the proxy would send
 * them to a page their role cannot open, then straight back out again.
 */
export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean =>
    canRoleReach(redirectPath, role);
