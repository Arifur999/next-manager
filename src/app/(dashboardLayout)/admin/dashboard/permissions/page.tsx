import PermissionsBoard from "@/components/modules/Admin/Permissions/PermissionsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { usersListQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { permissionGridQuery } from "@/queries/workspace.queries";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Permissions",
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
      <PageHeader title="Permissions">
        Module, action, and how far it reaches. Role decides what somebody can open at
        all; this narrows it further and can never widen it — so operations given
        &ldquo;Accounts&rdquo; here still cannot open the accounts page. Nothing set here
        reaches another company.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <PermissionsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default PermissionsPage;
