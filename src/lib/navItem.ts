import type { UserRole } from "./authUtils";
import type { NavIcon } from "./iconMapper";
import type { NavTarget } from "./navMatch";
import { plural } from "./text";

/** A live count a nav entry can carry; useNavBadges decides where each comes from. */
export type NavBadge = "pendingMembers" | "chatUnread";

/** What a screen reader hears after the entry's name, since the badge shows only a number. */
export const describeBadge = (badge: NavBadge, count: number): string => {
    if (badge === "pendingMembers") return `${plural(count, "person", "people")} waiting to join`;
    return plural(count, "unread message");
};

export type NavItem = NavTarget & {
    /** One noun, the same words as the heading of the page it opens. */
    title: string;
    // A name, not a component, so nav config stays serializable. iconMapper
    // turns it into a lucide icon.
    icon: NavIcon;
    badge?: NavBadge;
};

export type NavSection = {
    /** Untitled sections are always open; titled ones collapse. */
    title?: string;
    items: NavItem[];
};

/**
 * The sidebar, as data: one list per role, one entry per destination.
 *
 * The views of a page (Active clients, Overdue tasks, Unread chats) are tabs
 * on that page (lib/pageViews.ts), not entries here, so the sidebar names
 * places and each place lights exactly one entry.
 *
 * What each role sees mirrors what `AREAS` in authUtils.ts lets them open
 * (navItem.test.ts checks it), so the nav never offers a link that bounces.
 * Hiding a link is a courtesy, not a security boundary: proxy.ts and the
 * API's own role checks are what gate a route.
 */

/** In the account menu, not the sidebar: they are about you, not the company. */
export const ACCOUNT_LINKS: NavItem[] = [
    { title: "My profile", href: "/my-profile", icon: "Profile" },
    { title: "Change password", href: "/change-password", icon: "Password" },
];

const ADMIN_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard", icon: "Dashboard", exact: true },
            { title: "Sales", href: "/admin/dashboard/sales", icon: "Sales" },
            { title: "Delivery", href: "/admin/dashboard/delivery", icon: "Delivery" },
            { title: "Reports", href: "/admin/dashboard/reports", icon: "Reports" },
        ],
    },
    {
        title: "Work",
        items: [
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Clients" },
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Leads" },
            { title: "Services", href: "/admin/dashboard/services", icon: "Services" },
            { title: "Projects", href: "/admin/dashboard/projects", icon: "Projects" },
            { title: "Tasks", href: "/admin/dashboard/tasks", icon: "Tasks" },
            { title: "Chat", href: "/dashboard/chat", icon: "Chat", badge: "chatUnread" },
        ],
    },
    {
        title: "People",
        items: [
            { title: "Team", href: "/admin/dashboard/team-management", icon: "Team", badge: "pendingMembers" },
            { title: "Team directory", href: "/admin/dashboard/team-directory", icon: "Directory" },
            { title: "Departments", href: "/admin/dashboard/departments", icon: "Departments" },
            { title: "Workload", href: "/admin/dashboard/workload", icon: "Workload" },
            { title: "Availability", href: "/admin/dashboard/availability", icon: "Availability" },
            { title: "Leave calendar", href: "/admin/dashboard/leave-calendar", icon: "LeaveCalendar" },
        ],
    },
    {
        // Attendance, Leave and Timesheet live under /dashboard because
        // everybody has them; the admin uses the same pages to see everyone.
        title: "Time",
        items: [
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Timesheet" },
            { title: "Time approvals", href: "/admin/dashboard/time-approvals", icon: "TimeApprovals" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "Attendance" },
            { title: "Leave", href: "/dashboard/leave", icon: "Leave" },
        ],
    },
    {
        // Payroll sits with the money, never beside the team directory: every
        // colleague's salary on one screen is the most sensitive list here.
        title: "Money",
        items: [
            { title: "Accounts", href: "/admin/dashboard/accounts", icon: "Accounts" },
            { title: "Transactions", href: "/admin/dashboard/transactions", icon: "Transactions" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "Invoices" },
            { title: "Payments", href: "/admin/dashboard/payments", icon: "Payments" },
            { title: "Expenses", href: "/admin/dashboard/expenses", icon: "Expenses" },
            { title: "Currency exchange", href: "/admin/dashboard/exchange", icon: "Exchange" },
            { title: "Team payouts", href: "/admin/dashboard/payouts", icon: "Payouts" },
            { title: "Payroll", href: "/admin/dashboard/payroll", icon: "Payroll" },
            { title: "Owner withdrawals", href: "/admin/dashboard/withdrawals", icon: "Withdrawals" },
            // Informal lending between people; a bank loan with a schedule is Loans.
            { title: "Due payments", href: "/admin/dashboard/due-payments", icon: "DuePayments" },
            { title: "Loans", href: "/admin/dashboard/loans", icon: "Loans" },
            { title: "Shareholders", href: "/admin/dashboard/shareholders", icon: "Shareholders" },
        ],
    },
    {
        // Everything an admin configures about their own agency.
        title: "Company",
        items: [
            { title: "Business information", href: "/admin/dashboard/business", icon: "Business" },
            { title: "Permissions", href: "/admin/dashboard/permissions", icon: "Permissions" },
            { title: "Notifications", href: "/admin/dashboard/notifications", icon: "Notifications" },
            { title: "Security", href: "/admin/dashboard/security", icon: "Security" },
            { title: "Project settings", href: "/admin/dashboard/project-settings", icon: "ProjectSettings" },
            { title: "Task settings", href: "/admin/dashboard/workflow", icon: "TaskSettings" },
            // Nobody can ask to be away without a leave kind to ask against.
            { title: "Leave settings", href: "/admin/dashboard/leave-settings", icon: "LeaveSettings" },
            { title: "Finance configuration", href: "/admin/dashboard/finance-config", icon: "FinanceConfiguration" },
            { title: "Targets", href: "/admin/dashboard/targets", icon: "Targets" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "Vault" },
            { title: "Activity", href: "/admin/dashboard/activity", icon: "Activity" },
        ],
    },
];

const SALES_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard/sales", icon: "Dashboard" },
            // Lands on the first report they may open and stays lit on the other.
            {
                title: "Reports",
                href: "/admin/dashboard/reports/clients",
                activePath: "/admin/dashboard/reports",
                icon: "Reports",
            },
        ],
    },
    {
        // The job in the order it happens: a lead becomes a client, a client
        // gets billed. Projects and Tasks are read-only for sales at the API.
        title: "Work",
        items: [
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Leads" },
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Clients" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "Invoices" },
            { title: "Services", href: "/admin/dashboard/services", icon: "Services" },
            { title: "Projects", href: "/admin/dashboard/projects", icon: "Projects" },
            // Work inside the clients they brought in: the task question a seller has.
            { title: "Tasks", href: "/admin/dashboard/tasks?client_owner=me", icon: "Tasks" },
            { title: "Chat", href: "/dashboard/chat", icon: "Chat", badge: "chatUnread" },
        ],
    },
    {
        title: "Workspace",
        items: [
            { title: "Team directory", href: "/admin/dashboard/team-directory", icon: "Directory" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "Attendance" },
            { title: "Leave", href: "/dashboard/leave", icon: "Leave" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "Vault" },
        ],
    },
];

const PROJECT_MANAGER_SECTIONS: NavSection[] = [
    {
        items: [
            { title: "Dashboard", href: "/admin/dashboard/delivery", icon: "Dashboard" },
            {
                title: "Reports",
                href: "/admin/dashboard/reports/projects",
                activePath: "/admin/dashboard/reports",
                icon: "Reports",
            },
        ],
    },
    {
        // Services are read, not shaped: the seller decides what is on offer.
        title: "Work",
        items: [
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Clients" },
            { title: "Services", href: "/admin/dashboard/services", icon: "Services" },
            { title: "Projects", href: "/admin/dashboard/projects", icon: "Projects" },
            { title: "Tasks", href: "/admin/dashboard/tasks", icon: "Tasks" },
            { title: "Chat", href: "/dashboard/chat", icon: "Chat", badge: "chatUnread" },
        ],
    },
    {
        title: "People",
        items: [
            { title: "Team directory", href: "/admin/dashboard/team-directory", icon: "Directory" },
            { title: "Workload", href: "/admin/dashboard/workload", icon: "Workload" },
            // Workload read from the other end: one subtraction, one query.
            { title: "Availability", href: "/admin/dashboard/availability", icon: "Availability" },
            { title: "Leave calendar", href: "/admin/dashboard/leave-calendar", icon: "LeaveCalendar" },
        ],
    },
    {
        // A project manager approves hours and decides leave.
        title: "Time",
        items: [
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Timesheet" },
            { title: "Time approvals", href: "/admin/dashboard/time-approvals", icon: "TimeApprovals" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "Attendance" },
            { title: "Leave", href: "/dashboard/leave", icon: "Leave" },
        ],
    },
    {
        // Shaping the board is theirs; leave policy stays with the admin.
        title: "Workspace",
        items: [
            { title: "Task settings", href: "/admin/dashboard/workflow", icon: "TaskSettings" },
            { title: "Project settings", href: "/admin/dashboard/project-settings", icon: "ProjectSettings" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "Vault" },
        ],
    },
];

const OPERATIONS_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/dashboard", icon: "Dashboard", exact: true }] },
    {
        // Their own tasks and the projects and clients they are on: the API
        // narrows every one of these, ?mine=true only says so in the URL.
        title: "Work",
        items: [
            { title: "Tasks", href: "/dashboard/tasks", icon: "Tasks" },
            { title: "Projects", href: "/admin/dashboard/projects?mine=true", icon: "Projects" },
            { title: "Clients", href: "/admin/dashboard/clients", icon: "Clients" },
            { title: "Team directory", href: "/admin/dashboard/team-directory", icon: "Directory" },
            { title: "Chat", href: "/dashboard/chat", icon: "Chat", badge: "chatUnread" },
        ],
    },
    {
        // The hours every utilisation figure is built from, and their own days.
        title: "Time",
        items: [
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Timesheet" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "Attendance" },
            { title: "Leave", href: "/dashboard/leave", icon: "Leave" },
        ],
    },
];

// The platform console shares nothing with a company. Every area is its own
// route, so a link to one can be sent to a colleague.
const SUPER_ADMIN_SECTIONS: NavSection[] = [
    { items: [{ title: "Overview", href: "/platform", icon: "Dashboard", exact: true }] },
    {
        title: "Customers",
        items: [
            { title: "Companies", href: "/platform/customers", icon: "Business" },
            { title: "Paying companies", href: "/platform/active-users", icon: "Subscriptions" },
            { title: "Invite an agency", href: "/platform/invite-agency", icon: "Invite" },
        ],
    },
    {
        title: "Revenue",
        items: [
            { title: "Plans", href: "/platform/plans", icon: "Plans" },
            { title: "Financial report", href: "/platform/finance", icon: "Reports" },
        ],
    },
    {
        title: "Outreach",
        items: [{ title: "Campaigns", href: "/platform/campaigns", icon: "Campaigns" }],
    },
    {
        // The people who run the platform with you, never a customer's staff.
        title: "Platform team",
        items: [
            { title: "Team and access", href: "/platform/permissions", icon: "Team" },
            { title: "Invite an operator", href: "/platform/invite-operator", icon: "Invite" },
            { title: "Activity log", href: "/platform/activity", icon: "Activity" },
        ],
    },
    { items: [{ title: "Settings", href: "/platform/settings", icon: "Settings" }] },
];

const BY_ROLE: Record<UserRole, NavSection[]> = {
    super_admin: SUPER_ADMIN_SECTIONS,
    admin: ADMIN_SECTIONS,
    sales: SALES_SECTIONS,
    project_manager: PROJECT_MANAGER_SECTIONS,
    operations: OPERATIONS_SECTIONS,
};

export const getNavSections = (role: UserRole): NavSection[] => BY_ROLE[role];
