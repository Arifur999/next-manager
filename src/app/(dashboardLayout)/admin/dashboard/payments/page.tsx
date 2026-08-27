import PaymentsTable from "@/components/modules/Admin/Payments/PaymentsTable";
import { getPayments } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
};

const PaymentsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["payments", ""],
    queryFn: () => getPayments(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Money in from clients. Always USD — BDT only appears once you exchange.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PaymentsTable />
      </HydrationBoundary>
    </div>
  );
};

export default PaymentsPage;
