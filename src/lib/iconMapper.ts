import {
    LayoutDashboard,
    LogOut,
    Settings,
    User,
    Users,
    type LucideIcon,
} from "lucide-react";

// Keeps nav config serializable: the config stores a name, this turns it into a
// component at render time.
const ICONS: Record<string, LucideIcon> = {
    LayoutDashboard,
    LogOut,
    Settings,
    User,
    Users,
};

export const getIcon = (name: string): LucideIcon => ICONS[name] ?? LayoutDashboard;
