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
            { title: "All Services", href: "/admin/dashboard/services", icon: "Package" },
            { title: "Service Categories", href: "/admin/dashboard/services/categories", icon: "FolderTree" },
            { title: "Service Packages", href: "/admin/dashboard/services/templates", icon: "Boxes" },
            { title: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
        ],
    },
    {
        title: "Tasks",
        items: [
            { title: "Board", href: "/admin/dashboard/tasks", icon: "ListChecks" },
            { title: "List", href: "/admin/dashboard/tasks?view=list", icon: "FileText" },
            { title: "Calendar", href: "/admin/dashboard/tasks?view=calendar", icon: "CalendarDays" },
            // By status NAME, for the same reason the project views are: a
            // sidebar href cannot carry an id that differs per agency.
            { title: "Review", href: "/admin/dashboard/tasks?status=In review", icon: "UserCheck" },
            { title: "Overdue", href: "/admin/dashboard/tasks?overdue=true", icon: "Clock" },
            { title: "My Tasks", href: "/admin/dashboard/tasks?mine=true", icon: "User" },
        ],
    },
    {
        title: "Team",
        items: [
            { title: "Users", href: "/admin/dashboard/team-management", icon: "UsersRound" },
            { title: "Departments", href: "/admin/dashboard/departments", icon: "Network" },
            { title: "Roles & Permissions", href: "/admin/dashboard/permissions", icon: "Lock" },
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
            { title: "Time Approvals", href: "/admin/dashboard/time-approvals", icon: "UserCheck" },
            // Attendance and Leave live under /dashboard because everybody
            // has them — the same route the whole company uses, linked from
            // here the way Timesheet already is. Payroll is the exception:
            // every colleague's salary on one screen, admin only.
            { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
            { title: "Leave", href: "/dashboard/leave", icon: "CalendarOff" },
            { title: "Payroll", href: "/admin/dashboard/payroll", icon: "HandCoins" },
        ],
    },
    {
        // Five entries, one board. Built as separate pages this would be five
        // copies of the same two queries and five places to fix one bug.
        title: "Chat",
        items: [
            { title: "All", href: "/dashboard/chat", icon: "MessagesSquare" },
            { title: "Unread", href: "/dashboard/chat?unread=true", icon: "BellRing" },
            { title: "Direct", href: "/dashboard/chat?type=direct", icon: "User" },
            { title: "Groups", href: "/dashboard/chat?type=group", icon: "UsersRound" },
            { title: "Archived", href: "/dashboard/chat?archived=true", icon: "Archive" },
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
            // A bank loan is not Due Payments: that is informal lending between
            // people, with no schedule, no interest and no term.
            { title: "Loans", href: "/admin/dashboard/loans", icon: "Landmark" },
            { title: "Shareholders", href: "/admin/dashboard/shareholders", icon: "PieChart" },
        ],
    },
    {
        // Five questions, five pages. One screen carrying all five answers is
        // one nobody reads to the bottom of.
        title: "Reports",
        items: [
            { title: "Business", href: "/admin/dashboard/reports", icon: "ChartLine" },
            { title: "Clients", href: "/admin/dashboard/reports/clients", icon: "Users" },
            { title: "Projects", href: "/admin/dashboard/reports/projects", icon: "FolderKanban" },
            { title: "Tasks", href: "/admin/dashboard/reports/tasks", icon: "ListChecks" },
            { title: "Team", href: "/admin/dashboard/reports/team", icon: "UsersRound" },
            { title: "Finance", href: "/admin/dashboard/reports/finance", icon: "Scale" },
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
            { title: "Notifications", href: "/admin/dashboard/notifications", icon: "BellRing" },
            { title: "Security", href: "/admin/dashboard/security", icon: "ShieldCheck" },
            { title: "Project Settings", href: "/admin/dashboard/project-settings", icon: "FolderKanban" },
            { title: "Task Settings", href: "/admin/dashboard/workflow", icon: "ListChecks" },
            // Not optional furniture: nobody can ask to be away without a kind
            // to ask against, so this is the screen that keeps leave usable.
            { title: "Leave Settings", href: "/admin/dashboard/leave-settings", icon: "CalendarOff" },
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
        // The job, in the order it happens: a lead becomes a client, a client
        // gets billed. The three client views are one board reading ?status=,
        // which the ClientStatus enum already has exactly.
        title: "Clients",
        items: [
            { title: "Leads", href: "/admin/dashboard/leads", icon: "Target" },
            { title: "All Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Active Clients", href: "/admin/dashboard/clients?status=active", icon: "UserCheck" },
            { title: "Inactive Clients", href: "/admin/dashboard/clients?status=inactive", icon: "Users" },
            { title: "Invoices", href: "/admin/dashboard/invoices", icon: "FileText" },
        ],
    },
    {
        // Sales shapes the catalogue too - they are the ones who know what is
        // being sold and for how much. A service's own page is reached by
        // clicking its name, not by a sidebar entry with no id to point at.
        title: "Services",
        items: [
            { title: "All Services", href: "/admin/dashboard/services", icon: "Package" },
            { title: "Categories", href: "/admin/dashboard/services/categories", icon: "FolderTree" },
            { title: "Packages", href: "/admin/dashboard/services/templates", icon: "Boxes" },
        ],
    },
    {
        // Watching, not running. Sales opens a project their client is behind
        // and sees where it has got to; every write behind these is refused by
        // the API, so they are read-only where it cannot be worked around.
        title: "Delivery",
        items: [
            { title: "Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
            { title: "My Tasks", href: "/admin/dashboard/tasks?mine=true", icon: "User" },
            // Not "tasks assigned to me" but "work inside what I brought in" -
            // a different question, and the one a salesperson actually has.
            { title: "Sales Tasks", href: "/admin/dashboard/tasks?client_owner=me", icon: "ListChecks" },
        ],
    },
    {
        title: "Chat",
        items: [
            { title: "All", href: "/dashboard/chat", icon: "MessagesSquare" },
            { title: "Direct Messages", href: "/dashboard/chat?type=direct", icon: "User" },
            { title: "Groups", href: "/dashboard/chat?type=group", icon: "UsersRound" },
            { title: "Project Conversations", href: "/dashboard/chat?type=project", icon: "FolderKanban" },
        ],
    },
    {
        // Both scoped to the clients this person brought in - the server forces
        // it rather than reading it from the query.
        title: "Reports",
        items: [
            { title: "Client Reports", href: "/admin/dashboard/reports/clients", icon: "Users" },
            { title: "Sales Reports", href: "/admin/dashboard/reports/sales", icon: "ChartLine" },
        ],
    },
    {
        title: "Workspace",
        items: [
            { title: "Team", href: "/admin/dashboard/team-directory", icon: "UsersRound" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
            { title: "Leave", href: "/dashboard/leave", icon: "CalendarOff" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" },
        ],
    },
];

const PROJECT_MANAGER_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/admin/dashboard/delivery", icon: "LayoutDashboard" }] },
    {
        title: "Clients",
        items: [
            { title: "All Clients", href: "/admin/dashboard/clients", icon: "Users" },
            { title: "Active Clients", href: "/admin/dashboard/clients?status=active", icon: "UserCheck" },
        ],
    },
    {
        // Read, not shaped. A project manager picks what a project delivers;
        // the seller decides what is on offer, and the API refuses them every
        // write behind these pages - so the board hides the form rather than
        // offering one that fails.
        title: "Services",
        items: [
            { title: "All Services", href: "/admin/dashboard/services", icon: "Package" },
            { title: "Service Templates", href: "/admin/dashboard/services/templates", icon: "Boxes" },
        ],
    },
    {
        // Six views, one board reading ?status= and ?mine= off the URL. By
        // status NAME, because a sidebar href is a static string: an id differs
        // per agency, and category cannot tell Active from Review - both are
        // `active`.
        title: "Projects",
        items: [
            { title: "All Projects", href: "/admin/dashboard/projects", icon: "FolderKanban" },
            { title: "My Projects", href: "/admin/dashboard/projects?mine=true", icon: "User" },
            { title: "Planning", href: "/admin/dashboard/projects?status=Planning", icon: "Clock" },
            { title: "Active", href: "/admin/dashboard/projects?status=Active", icon: "ChartLine" },
            { title: "Review", href: "/admin/dashboard/projects?status=Review", icon: "UserCheck" },
            { title: "On Hold", href: "/admin/dashboard/projects?status=On hold", icon: "Archive" },
            { title: "Completed", href: "/admin/dashboard/projects?status=Completed", icon: "CheckCircle2" },
        ],
    },
    {
        title: "Tasks",
        items: [
            { title: "All Tasks", href: "/admin/dashboard/tasks", icon: "ListChecks" },
            { title: "My Tasks", href: "/admin/dashboard/tasks?mine=true", icon: "User" },
            { title: "List", href: "/admin/dashboard/tasks?view=list", icon: "FileText" },
            { title: "Calendar", href: "/admin/dashboard/tasks?view=calendar", icon: "CalendarDays" },
            { title: "Review", href: "/admin/dashboard/tasks?status=In review", icon: "UserCheck" },
            { title: "Overdue", href: "/admin/dashboard/tasks?overdue=true", icon: "Clock" },
        ],
    },
    {
        title: "Team",
        items: [
            { title: "Team Members", href: "/admin/dashboard/team-directory", icon: "UsersRound" },
            { title: "Workload", href: "/admin/dashboard/workload", icon: "ChartLine" },
            // The same figures as Workload read from the other end. One
            // subtraction shown twice, from one query, so they cannot disagree.
            { title: "Availability", href: "/admin/dashboard/availability", icon: "UserCheck" },
            { title: "Leave Calendar", href: "/admin/dashboard/leave-calendar", icon: "CalendarOff" },
            // Not in the sidebar you drew, but existing working duties: a PM
            // approves hours and decides leave, and dropping them because a
            // sketch omitted them would take away something nobody asked to
            // lose. They belong here, with the rest of the people work.
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
            { title: "Time Approvals", href: "/admin/dashboard/time-approvals", icon: "UserCheck" },
            { title: "Leave", href: "/dashboard/leave", icon: "CalendarOff" },
            { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
        ],
    },
    {
        title: "Chat",
        items: [
            { title: "All", href: "/dashboard/chat", icon: "MessagesSquare" },
            { title: "Direct Messages", href: "/dashboard/chat?type=direct", icon: "User" },
            { title: "Groups", href: "/dashboard/chat?type=group", icon: "UsersRound" },
            { title: "Project Chats", href: "/dashboard/chat?type=project", icon: "FolderKanban" },
            { title: "Archived", href: "/dashboard/chat?archived=true", icon: "Archive" },
        ],
    },
    {
        title: "Reports",
        items: [
            { title: "Project Reports", href: "/admin/dashboard/reports/projects", icon: "FolderKanban" },
            { title: "Task Reports", href: "/admin/dashboard/reports/tasks", icon: "ListChecks" },
            { title: "Team Workload", href: "/admin/dashboard/reports/team", icon: "UsersRound" },
        ],
    },
    {
        title: "Workspace",
        items: [
            // Shaping the board is theirs to control, so the settings that do it
            // are too. Leave policy is not - that stays with the admin.
            { title: "Task Settings", href: "/admin/dashboard/workflow", icon: "ListChecks" },
            { title: "Project Settings", href: "/admin/dashboard/project-settings", icon: "FolderKanban" },
            { title: "Vault", href: "/admin/dashboard/vault", icon: "KeyRound" },
        ],
    },
];

const OPERATIONS_SECTIONS: NavSection[] = [
    { items: [{ title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }] },
    {
        // Five readings of one question: what do I need to do. All one board
        // reading its filter off the URL - "upcoming" is a seven-day window,
        // and "completed" is read by what a status MEANS, so renaming a column
        // does not empty it.
        title: "My Work",
        items: [
            { title: "My Tasks", href: "/dashboard/tasks", icon: "ListChecks" },
            { title: "Due Today", href: "/dashboard/tasks?due=today", icon: "CalendarCheck" },
            { title: "Upcoming", href: "/dashboard/tasks?due=upcoming", icon: "CalendarDays" },
            { title: "Overdue", href: "/dashboard/tasks?overdue=true", icon: "Clock" },
            { title: "Completed", href: "/dashboard/tasks?completed=true", icon: "CheckCircle2" },
            // Not in the sidebar you drew, but this role's existing duty and the
            // thing every utilisation figure is built from. Dropping it because
            // a sketch omitted it would take away something nobody asked to
            // lose.
            { title: "Timesheet", href: "/dashboard/timesheet", icon: "Clock" },
        ],
    },
    {
        // The projects they are on, and nothing else - decided by the API,
        // not by this entry. ?mine=true says so anyway: a page whose title
        // reads "My" and whose query does not is how a scope quietly stops
        // being one.
        title: "Projects",
        items: [
            { title: "My Projects", href: "/admin/dashboard/projects?mine=true", icon: "FolderKanban" },
        ],
    },
    {
        title: "Chat",
        items: [
            { title: "All", href: "/dashboard/chat", icon: "MessagesSquare" },
            { title: "Direct Messages", href: "/dashboard/chat?type=direct", icon: "User" },
            { title: "Groups", href: "/dashboard/chat?type=group", icon: "UsersRound" },
            { title: "Project Chats", href: "/dashboard/chat?type=project", icon: "FolderKanban" },
        ],
    },
    {
        title: "My Account",
        items: [
            { title: "Profile", href: "/my-profile", icon: "User" },
            // The API narrows both of these to their own rows, so what an
            // operations member opens here is their own day and nobody else's -
            // the same page an admin uses to see everyone.
            { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
            { title: "Leave", href: "/dashboard/leave", icon: "CalendarOff" },
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
