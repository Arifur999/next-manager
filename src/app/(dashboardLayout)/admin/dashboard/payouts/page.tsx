import PayoutsTable from "@/components/modules/Admin/Payouts/PayoutsTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { teamPayoutsListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Team Payouts",
};

const PayoutsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(teamPayoutsListQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team payouts</h1>
        <p className="text-sm text-muted-foreground">
          What the agency pays its own people. A payout tied to a project counts as that
          project&apos;s team cost.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <PayoutsTable />
      </QueryPrefetch>
    </div>
  );
};

export default PayoutsPage;
