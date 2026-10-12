import PermissionsBoard from "@/components/modules/Admin/Permissions/PermissionsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { usersListQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { permissionGridQuery } from "@/queries/workspace.queries";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

const PermissionsPage = async () => {

  // Both prefetched together, and the board rendered inside the one boundary
  // that carries them. A component reading a key from outside the boundary
  // registers an empty entry, and hydration then declines to overwrite it.
  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(permissionGridQuery()),
    queryClient.prefetchQuery(usersListQuery()),
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

      <QueryPrefetch prefetch={prefetch}>
        <PermissionsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default PermissionsPage;
