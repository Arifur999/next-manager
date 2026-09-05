import PermissionsBoard from "@/components/modules/Admin/Permissions/PermissionsBoard";
import { getPermissionGrid } from "@/services/permission.services";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

const PermissionsPage = async () => {
  const queryClient = new QueryClient();

  // Both prefetched together, and the board rendered inside the one boundary
  // that carries them. A component reading a key from outside the boundary
  // registers an empty entry, and hydration then declines to overwrite it.
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["permissions", ""], queryFn: () => getPermissionGrid() }),
    queryClient.prefetchQuery({ queryKey: ["users", ""], queryFn: () => getAllUsers() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Module, action, and how far it reaches. Role decides what somebody can open at
          all; this narrows it further and can never widen it — so operations given
          &ldquo;Accounts&rdquo; here still cannot open the accounts page. Nothing set here
          reaches another company.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PermissionsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default PermissionsPage;
