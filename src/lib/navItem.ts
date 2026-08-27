import { getDefaultDashboardRoute, toRouteOwner, type UserRole } from "./authUtils";

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

// Adding a page means adding an entry here, never editing the sidebar component.
export const getCommonNavItems = (role: UserRole): NavSection[] => {
    return [
        {
            items: [
                { title: "Dashboard", href: getDefaultDashboardRoute(role), icon: "LayoutDashboard" },
                { title: "My Profile", href: "/my-profile", icon: "User" },
            ],
        },
        {
            title: "Settings",
            items: [{ title: "Change Password", href: "/change-password", icon: "Settings" }],
        },
    ];
};

export const ownerNavItems: NavSection[] = [
    {
        title: "Workspace",
        items: [
            { title: "Team", href: "/admin/dashboard/team-management", icon: "Users" },
        ],
    },
];

export const staffNavItems: NavSection[] = [
    {
        title: "Workspace",
        items: [],
    },
];

export const getNavSections = (role: UserRole): NavSection[] => {
    const roleSections = toRouteOwner(role) === "OWNER" ? ownerNavItems : staffNavItems;
    return [...getCommonNavItems(role), ...roleSections].filter(
        (section) => section.items.length > 0,
    );
};
