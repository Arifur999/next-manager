import type { UserRole } from "./authUtils";

export type NavItem = {
    title: string;
    href: string;
    // A string, not a component, so nav config stays serializable and can cross
    // the server/client boundary. iconMapper turns it into a lucide icon.
    icon: string;
};

export type NavSection = {
    title?: string;
    items: NavItem[];
};

/**
 * The sidebar, as data — one list per role.
 *
 * Adding a page means adding an entry here, never editing the sidebar
 * component. What each role sees mirrors what `AREAS` in authUtils.ts actually
 * lets them open, so the nav never offers a link that bounces.
 *
 * Hiding a link is a courtesy, not a security boundary: proxy.ts and the API's
 * own role checks are what actually gate a route.
 */

const ACCOUNT_SECTION: NavSection = {
    title: "Account",
    items: [
        { title: "My Profile", href: "/my-profile", icon: "User" },
        { title: "Change Password", href: "/change-password", icon: "Lock" },
    ],
};

const ADMIN_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
            { title: "Sales", href: "/admin/dashboard/sales", icon: "Target" },
            { title: "Delivery", href: "/admin/dashboard/delivery", icon: "FolderKanban" },
        ],
    },
    {
        // Sub-entries are filters on one board, not separate pages. Four client
        // pages would be four places to fix the same bug; the sidebar gets the
        // four entries either way, and the board stays one file.
        title: "Operations",
        items: [
            { title: "All Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Active", href: "/admin/dashboard/clients?status=active", icon: "UserCheck" },
            { title: "Inactive", href: "/admin/dashboard/clients?status=inactive", icon: "Users" },
            { title: "Archived", href: "/admin/dashboard/clients?status=archived", icon: "Archive" },
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Target" },
            { title: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
        ],
    },
    {
        title: "Tasks",
        items: [
            { title: "Board", href: "/admin/dashboard/tasks", icon: "ListChecks" },
            { title: "List", href: "/admin/dashboard/tasks?view=list", icon: "FileText" },
            { title: "Overdue", href: "/admin/dashboard/tasks?overdue=true", icon: "Clock" },
            { title: "My Tasks", href: "/admin/dashboard/tasks?mine=true", icon: "User" },
        ],
    },
    {
        title: "Team",
        items: [
            { title: "Users", href: "/admin/dashboard/team-management", icon: "UsersRound" },
            { title: "Departments", href: "/admin/dashboard/departments", icon: "Network" },
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
            { title: "Time Approvals", href: "/admin/dashboard/time-approvals", icon: "UserCheck" },
        ],
    },
    {
        title: "Accounts",
        items: [
            { title: "Overview", href: "/admin/dashboard/accounts", icon: "Wallet" },
            { title: "Transactions", href: "/admin/dashboard/transactions", icon: "Scale" },
            { title: "Income", href: "/admin/dashboard/transactions?kind=income", icon: "ArrowDownLeft" },
            { title: "Expenses", href: "/admin/dashboard/transactions?kind=expense", icon: "Receipt" },
            { title: "Transfers", href: "/admin/dashboard/transactions?kind=transfer", icon: "ArrowLeftRight" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "FileText" },
            { title: "Record a payment", href: "/admin/dashboard/payments", icon: "ArrowDownLeft" },
            { title: "Record an expense", href: "/admin/dashboard/expenses", icon: "Receipt" },
            { title: "Record an exchange", href: "/admin/dashboard/exchange", icon: "ArrowLeftRight" },
            { title: "Team Payouts", href: "/admin/dashboard/payouts", icon: "HandCoins" },
            { title: "Withdrawals", href: "/admin/dashboard/withdrawals", icon: "PiggyBank" },
            { title: "Due Payments", href: "/admin/dashboard/due-payments", icon: "Scale" },
        ],
    },
    {
        title: "Reports",
        items: [
            { title: "Reports", href: "/admin/dashboard/reports", icon: "ChartLine" },
        ],
    },
    {
        // Everything an admin configures about their own agency, in the words
        // an admin uses for them.
        // Users and Departments live under Team, where the work with people
        // happens. Listing them twice would light two entries at once and give
        // the reader two doors to one room.
        title: "Admin",
        items: [
            { title: "Business Information", href: "/admin/dashboard/business", icon: "Building2" },
            { title: "Finance Settings", href: "/admin/dashboard/finance-config", icon: "Settings" },
            { title: "Targets", href: "/admin/dashboard/targets", icon: "Target" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" },
            { title: "Audit Log", href: "/admin/dashboard/activity", icon: "History" },
        ],
    },
];

const SALES_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/admin/dashboard/sales", icon: "LayoutDashboard" }] },
    {
        title: "Pipeline",
        items: [
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Target" },
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "FileText" },
        ],
    },
    {
        title: "Workspace",
        items: [{ title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" }],
    },
];

const PROJECT_MANAGER_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/admin/dashboard/delivery", icon: "LayoutDashboard" }] },
    {
        title: "Delivery",
        items: [
            { title: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
            { title: "Tasks", href: "/admin/dashboard/tasks", icon: "ListChecks" },
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
            { title: "Time Approvals", href: "/admin/dashboard/time-approvals", icon: "UserCheck" },
            { title: "Team", href: "/admin/dashboard/team-management", icon: "UsersRound" },
        ],
    },
    {
        title: "Workspace",
        items: [
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" },
        ],
    },
];

const OPERATIONS_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
            { title: "My Tasks", href: "/dashboard/tasks", icon: "ListChecks" },
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
        ],
    },
];

// The platform console is its own thing and shares nothing with a company.
//
// Every area is its own route rather than a tab, so this list can name them
// and a link to one can be sent to a colleague.
const SUPER_ADMIN_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/platform", icon: "LayoutDashboard" }] },
    {
        title: "Customers",
        items: [
            // First, because it is the console's actual job: bring agency
            // owners on. Everything else here is about the ones already in.
            { title: "Invite an agency", href: "/platform/invite-agency", icon: "MailPlus" },
            { title: "All users", href: "/platform/customers", icon: "UsersRound" },
            { title: "Active users", href: "/platform/active-users", icon: "UserCheck" },
            { title: "Plans", href: "/platform/plans", icon: "Wallet" },
            { title: "Campaigns", href: "/platform/campaigns", icon: "Megaphone" },
        ],
    },
    {
        title: "Money",
        items: [
            { title: "Financial report", href: "/platform/finance", icon: "ChartLine" },
        ],
    },
    {
        // "Your team", not "Team": everything under here is about the people
        // who run AGENCIO with you, never about a customer's staff. The entry
        // below used to read "Invite admin" and was reasonably taken to mean
        // the admin of an agency - it hands out the run of the platform.
        title: "Your team",
        items: [
            { title: "Invite operator", href: "/platform/invite-operator", icon: "User" },
            { title: "Permissions", href: "/platform/permissions", icon: "KeyRound" },
            { title: "Operator activity", href: "/platform/activity", icon: "History" },
        ],
    },
    {
        title: "Platform",
        items: [{ title: "Settings", href: "/platform/settings", icon: "Settings" }],
    },
];

const BY_ROLE: Record<UserRole, NavSection[]> = {
    super_admin: SUPER_ADMIN_SECTIONS,
    admin: ADMIN_SECTIONS,
    sales: SALES_SECTIONS,
    project_manager: PROJECT_MANAGER_SECTIONS,
    operations: OPERATIONS_SECTIONS,
};

export const getNavSections = (role: UserRole): NavSection[] => [
    ...BY_ROLE[role],
    ACCOUNT_SECTION,
];
