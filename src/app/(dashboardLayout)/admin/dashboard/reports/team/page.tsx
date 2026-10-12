import TeamReport from "@/components/modules/Admin/Reports/TeamReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { kpiQuery } from "@/queries/insights.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Team report",
};

const TeamReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(kpiQuery("delivery")),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          What each team spent its time on, and what it cost. Role cannot answer this — your designers and developers are all operations.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <TeamReport />
      </QueryPrefetch>
    </div>
  );
};

export default TeamReportPage;
