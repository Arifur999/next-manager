"use client";

import type { UserRole } from "@/lib/authUtils";
import type { NavBadge } from "@/lib/navItem";
import { usersListQuery } from "@/queries/people.queries";
import { chatUnreadQuery } from "@/queries/workspace.queries";
import { useQuery } from "@tanstack/react-query";

export type NavBadgeCounts = Record<NavBadge, number>;

/** The live counts nav entries can carry. Only the roles that show a badge ask for it. */
export const useNavBadges = (role: UserRole): NavBadgeCounts => {
  // Only admin can approve, so only admin is asked: somebody waiting to join
  // cannot sign in to chase it. A minute is soon enough for a human.
  const pending = useQuery({
    ...usersListQuery("status=pending"),
    enabled: role === "admin",
    staleTime: 60_000,
  });

  // The platform operator belongs to no company and has no chat. The chat
  // board's own invalidations refresh this while it is open; the poll covers
  // every other page.
  const chat = useQuery({
    ...chatUnreadQuery(),
    enabled: role !== "super_admin",
    refetchInterval: 60_000,
  });

  return {
    pendingMembers: pending.data?.data?.length ?? 0,
    chatUnread: chat.data?.data?.unread_count ?? 0,
  };
};
