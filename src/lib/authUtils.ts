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

    // What delivery is measured by. The project manager runs it for the whole
    // agency, so these are not scoped the way a salesperson's are — and
    // reports/projects carries margin, which is theirs by design.
    //
    // Declared before the money rule below for the same reason the sales one
    // is: that rule claims every /reports path, and the first match wins.
    {
        exact: [
            "/admin/dashboard/reports/projects",
            "/admin/dashboard/reports/team",
            "/admin/dashboard/reports/tasks",
        ],
        pattern: [],
        roles: ["admin", "project_manager"],
    },

    // The two reports a salesperson may open, and only these two. Declared
    // before the money rule below, which claims every /reports path for
    // admin - the first matching rule wins, so this ordering IS the
    // permission and moving it would silently close both pages.
    //
    // Both are scoped to the caller's own clients by the server, which
    // forces it rather than reading it from the query.
    {
        exact: ["/admin/dashboard/reports/clients", "/admin/dashboard/reports/sales"],
        pattern: [],
        roles: ["admin", "sales"],
    },

    // How work MOVES: the columns a task or a project sits in. You listed
    // Workflow as the project manager's to control, and it is the one thing
    // under configuration that is about delivery rather than about the
    // company. leave-settings stays admin-only below — that is a policy about
    // people, not a workflow.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(workflow|project-settings)/],
        roles: ["admin", "project_manager"],
    },

    // Money and company state.
    {
        exact: [],
        pattern: [
            /^\/admin\/dashboard\/(accounts|payments|exchange|expenses|payouts|payroll|withdrawals|due-payments|loans|shareholders|reports|transactions)/,
            // Configuration. "settings" was one page and is now several;
            // the /^\/admin/ catch-all below would cover them anyway, but
            // naming them says they are admin-only on purpose rather than
            // by omission.
            /^\/admin\/dashboard\/(business|finance-config|departments|leave-settings|permissions|notifications|security)/,
        ],
        roles: ["admin"],
    },

    // Selling: the pipeline and what gets billed for it.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(leads|invoices|sales)/],
        roles: ["admin", "sales"],
    },

    // The catalogue. Sales shapes it and the project manager reads it — they
    // pick what a project is delivering, and a catalogue they cannot open
    // makes that a guess.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/services/],
        roles: ["admin", "sales", "project_manager"],
    },

    // Watching the work. Sales opens these to see where a client they brought
    // in has got to - and only to see. Every write behind them is refused by
    // the API to anybody but admin and the project manager, so "view, not
    // control" is enforced where it cannot be worked around, rather than by
    // hiding a page.
    // Operations reaches them too, and the same API scope decides what they
    // get: only the projects they are a member of, only the tasks assigned
    // to them. The pages hide every write they would be refused.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/(projects|tasks)/],
        roles: ["admin", "project_manager", "sales", "operations"],
    },

    // Running the work. The project manager's, not sales'.
    {
        exact: [],
        pattern: [
            /^\/admin\/dashboard\/(time-approvals|delivery|workload|availability|leave-calendar)/,
        ],
        roles: ["admin", "project_manager"],
    },

    // Running the PEOPLE. The admin's alone.
    //
    // Split out from the rule above rather than left inside it: this screen
    // adds, edits, deactivates and approves colleagues, and every one of those
    // writes is admin-only at the API. A project manager could open it and get
    // a page of buttons that all returned 403 — which teaches people the
    // product is broken rather than that they lack a permission. Their Team is
    // the read-only directory below.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/team-management/],
        roles: ["admin"],
    },

    // The directory. A separate page from team-management on purpose: that one
    // creates, edits and deactivates people, and sales has no business there.
    // This is a read-only list, and the API hands it a narrower projection with
    // no permissions and no status on it.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/team-directory/],
        roles: ["admin", "project_manager", "sales", "operations"],
    },

    // Shared workspace screens.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/vault/],
        roles: ["admin", "sales", "project_manager"],
    },

    // The clients they work FOR. Operations reaches the list; the API returns
    // only the clients whose projects they are on, and the page offers no row
    // link and no form - knowing who they are working for is the whole of
    // what this role needs.
    {
        exact: [],
        pattern: [/^\/admin\/dashboard\/clients/],
        roles: ["admin", "sales", "project_manager", "operations"],
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
