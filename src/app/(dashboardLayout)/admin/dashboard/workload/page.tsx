import WorkloadBoard from "@/components/modules/Admin/Team/WorkloadBoard";
import { getWorkload } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workload",
};

const WorkloadPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({ queryKey: ["workload"], queryFn: () => getWorkload() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workload</h1>
        <p className="text-sm text-muted-foreground">
          What everybody is carrying this week. Hours are counted as logged rather than as
          approved — approval comes days later, and a screen that waited for it would show
          a busy team as idle right up until it was too late to act on.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkloadBoard mode="load" />
      </HydrationBoundary>
    </div>
  );
};

export default WorkloadPage;
