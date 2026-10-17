import CapacityPanel from "@/components/modules/Admin/Team/CapacityPanel";
import WorkloadBoard from "@/components/modules/Admin/Team/WorkloadBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workloadQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Availability",
};

const AvailabilityPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workloadQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Availability">
        Who has room. The same figures as Workload read from the other end — one
        subtraction, shown twice, so the two screens cannot disagree about somebody&apos;s
        week.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <WorkloadBoard mode="free" />
      </QueryPrefetch>

      {/* Setting somebody's hours belongs here rather than on the admin's team
          screen: this is the page where a number being an assumption actually
          matters, and the project manager is the person who knows it. */}
      <CapacityPanel />
    </div>
  );
};

export default AvailabilityPage;
