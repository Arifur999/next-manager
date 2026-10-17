"use client";

import type { UserRole } from "@/lib/authUtils";
import {
  currentGroupId,
  NAV_GROUPS_COOKIE,
  NAV_GROUPS_MAX_AGE,
  serializeOpenGroups,
  toggleGroup,
  withGroupOpen,
} from "@/lib/navGroups";
import { getNavSections } from "@/lib/navItem";
import { usePathname } from "next/navigation";
import { createContext, use, useState, type ReactNode } from "react";

type NavGroups = {
  isOpen: (groupId: string) => boolean;
  toggle: (groupId: string) => void;
};

const NavGroupsContext = createContext<NavGroups | null>(null);

/**
 * Which sidebar groups are open, shared by the desktop sidebar and the phone
 * sheet and kept across navigations (the layout does not remount).
 *
 * `initialOpen` comes from the cookie the server read, so the server render
 * and the first browser render agree. The group holding the current page
 * opens by itself on arrival; closing it afterwards sticks until you leave.
 */
const NavGroupsProvider = ({
  role,
  initialOpen,
  children,
}: {
  role: UserRole;
  initialOpen: string[];
  children: ReactNode;
}) => {
  const pathname = usePathname();
  const current = currentGroupId(getNavSections(role), pathname);
  const [open, setOpen] = useState(() => withGroupOpen(initialOpen, current));
  const [openedFor, setOpenedFor] = useState(current);

  // React's pattern for adjusting state when an input changes, done during
  // render so the newly opened group paints with the page, not a frame later.
  if (current !== openedFor) {
    setOpenedFor(current);
    setOpen(withGroupOpen(open, current));
  }

  const toggle = (groupId: string) => {
    const next = toggleGroup(open, groupId);
    setOpen(next);
    document.cookie = `${NAV_GROUPS_COOKIE}=${serializeOpenGroups(next)}; Path=/; Max-Age=${NAV_GROUPS_MAX_AGE}; SameSite=Lax`;
  };

  return (
    <NavGroupsContext value={{ isOpen: (groupId) => open.includes(groupId), toggle }}>
      {children}
    </NavGroupsContext>
  );
};

export const useNavGroups = (): NavGroups => {
  const groups = use(NavGroupsContext);
  if (!groups) throw new Error("useNavGroups must be used inside NavGroupsProvider");
  return groups;
};

export default NavGroupsProvider;
