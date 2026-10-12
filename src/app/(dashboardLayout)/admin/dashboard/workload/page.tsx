import WorkloadBoard from "@/components/modules/Admin/Team/WorkloadBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workloadQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Workload",
};

const WorkloadPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workloadQuery());

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

      <QueryPrefetch prefetch={prefetch}>
        <WorkloadBoard mode="load" />
      </QueryPrefetch>
    </div>
  );
};

export default WorkloadPage;
