import TeamReport from "@/components/modules/Admin/Reports/TeamReport";
import { getKpi } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team report",
};

const TeamReportPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["kpi", "delivery"],
      queryFn: () => getKpi("delivery"),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          What each team spent its time on, and what it cost. Role cannot answer this — your designers and developers are all operations.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamReport />
      </HydrationBoundary>
    </div>
  );
};

export default TeamReportPage;
