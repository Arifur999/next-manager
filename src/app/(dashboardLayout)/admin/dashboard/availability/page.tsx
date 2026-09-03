import CapacityPanel from "@/components/modules/Admin/Team/CapacityPanel";
import WorkloadBoard from "@/components/modules/Admin/Team/WorkloadBoard";
import { getWorkload } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Availability",
};

const AvailabilityPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({ queryKey: ["workload"], queryFn: () => getWorkload() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Who has room. The same figures as Workload read from the other end — one
          subtraction, shown twice, so the two screens cannot disagree about somebody&apos;s
          week.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkloadBoard mode="free" />
      </HydrationBoundary>

      {/* Setting somebody's hours belongs here rather than on the admin's team
          screen: this is the page where a number being an assumption actually
          matters, and the project manager is the person who knows it. */}
      <CapacityPanel />
    </div>
  );
};

export default AvailabilityPage;
