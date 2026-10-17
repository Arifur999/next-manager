import TeamDirectory from "@/components/modules/Admin/Team/TeamDirectory";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { usersListQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Team Directory",
};

const TeamDirectoryPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(usersListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Team">
        Who works here and how to reach them. Adding, editing and deactivating people
        happens under Users, which is the admin&apos;s screen — this one only reads.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <TeamDirectory />
      </QueryPrefetch>
    </div>
  );
};

export default TeamDirectoryPage;
