import DuePaymentsBoard from "@/components/modules/Admin/DuePayments/DuePaymentsBoard";
import { getDuePeople, getDueTransactions } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Due Payments",
};

const DuePaymentsPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["due-people"], queryFn: () => getDuePeople() }),
    queryClient.prefetchQuery({
      queryKey: ["due-transactions"],
      queryFn: () => getDueTransactions(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Due payments</h1>
        <p className="text-sm text-muted-foreground">
          Informal lending, in and out. Kept apart from clients and team members — this balance is
          personal and does not belong in client revenue or team cost.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DuePaymentsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default DuePaymentsPage;
