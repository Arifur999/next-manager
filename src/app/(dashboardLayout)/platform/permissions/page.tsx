import PlatformTeam from "@/components/modules/Platform/PlatformTeam";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { platformAdminsQuery } from "@/queries/platform.queries";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team and access",
};

const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(platformAdminsQuery());

const TeamAndAccessPage = async () => {
  // Your own row is marked, and your own full access is shown rather than offered for editing.
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <PageHeader title="Team and access">
        Who runs the platform with you and what each of them may do. Everyone here can see every customer.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <PlatformTeam currentUserId={user?.id} />
      </QueryPrefetch>
    </div>
  );
};

export default TeamAndAccessPage;
