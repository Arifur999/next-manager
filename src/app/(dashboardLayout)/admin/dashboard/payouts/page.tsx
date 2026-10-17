import PayoutsTable from "@/components/modules/Admin/Payouts/PayoutsTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { teamPayoutsListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Team Payouts",
};

const PayoutsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(teamPayoutsListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Team payouts">
        What the agency pays its own people. A payout tied to a project counts as that
        project&apos;s team cost.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <PayoutsTable />
      </QueryPrefetch>
    </div>
  );
};

export default PayoutsPage;
