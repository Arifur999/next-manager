import PayoutsTable from "@/components/modules/Admin/Payouts/PayoutsTable";
import { getTeamPayouts } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Payouts",
};

const PayoutsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["payouts"],
    queryFn: () => getTeamPayouts(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team payouts</h1>
        <p className="text-sm text-muted-foreground">
          What the agency pays its own people. A payout tied to a project counts as that
          project&apos;s team cost.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PayoutsTable />
      </HydrationBoundary>
    </div>
  );
};

export default PayoutsPage;
