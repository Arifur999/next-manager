import LeadPipeline from "@/components/modules/Admin/Leads/LeadPipeline";
import { getLeadPipeline } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
};

const LeadsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["leads"],
    queryFn: () => getLeadPipeline(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Deals not won yet. Converting one creates the client and marks the lead in the same
          step, so the two can never disagree.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LeadPipeline />
      </HydrationBoundary>
    </div>
  );
};

export default LeadsPage;
