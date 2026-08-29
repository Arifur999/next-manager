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
        title: "CRM",
        items: [
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Target" },
        ],
    },
    {
        title: "Work",
        items: [
            { title: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
            { title: "Tasks", href: "/admin/dashboard/tasks", icon: "ListChecks" },
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
            { title: "Time Approvals", href: "/admin/dashboard/time-approvals", icon: "UserCheck" },
        ],
    },
    {
        title: "Finance",
        items: [
            { title: "Accounts", href: "/admin/dashboard/accounts", icon: "Wallet" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "FileText" },
            { title: "Payments", href: "/admin/dashboard/payments", icon: "ArrowDownLeft" },
            { title: "Exchange", href: "/admin/dashboard/exchange", icon: "ArrowLeftRight" },
            { title: "Expenses", href: "/admin/dashboard/expenses", icon: "Receipt" },
            { title: "Team Payouts", href: "/admin/dashboard/payouts", icon: "HandCoins" },
            { title: "Withdrawals", href: "/admin/dashboard/withdrawals", icon: "PiggyBank" },
            { title: "Due Payments", href: "/admin/dashboard/due-payments", icon: "Scale" },
            { title: "Reports", href: "/admin/dashboard/reports", icon: "ChartLine" },
        ],
    },
    {
        title: "Workspace",
        items: [
            { title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" },
            { title: "Team", href: "/admin/dashboard/team-management", icon: "UsersRound" },
            { title: "Settings", href: "/admin/dashboard/settings", icon: "Settings" },
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
const SUPER_ADMIN_SECTIONS: NavSection[] = [
    { items: [{ title: "Companies", href: "/platform", icon: "UsersRound" }] },
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
