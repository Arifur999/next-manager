import { toRouteOwner, type UserRole } from "./authUtils";

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
 * The sidebar, as data.
 *
 * Adding a page means adding an entry here, never editing the sidebar
 * component. The sections mirror the product's own shape — CRM, Projects,
 * Finance, Vault, Team, Settings — so the sidebar and the way people talk about
 * the app stay the same thing.
 *
 * This is only what the sidebar SHOWS. Every route is separately gated by
 * proxy.ts and by the API's own role checks, so hiding a link is a courtesy
 * rather than a security boundary.
 */

const OWNER_SECTIONS: NavSection[] = [
    {
        items: [{ title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" }],
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

// A member sees their own work and nothing financial.
const MEMBER_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
            { title: "My Tasks", href: "/dashboard/tasks", icon: "ListChecks" },
        ],
    },
];

const ACCOUNT_SECTION: NavSection = {
    title: "Account",
    items: [
        { title: "My Profile", href: "/my-profile", icon: "User" },
        { title: "Change Password", href: "/change-password", icon: "Lock" },
    ],
};

export const getNavSections = (role: UserRole): NavSection[] => {
    const base = toRouteOwner(role) === "OWNER" ? OWNER_SECTIONS : MEMBER_SECTIONS;
    return [...base, ACCOUNT_SECTION];
};
