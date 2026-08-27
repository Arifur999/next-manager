import ExchangeTable from "@/components/modules/Admin/Exchange/ExchangeTable";
import { getExchanges } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchange",
};

const ExchangePage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["exchanges"],
    queryFn: () => getExchanges(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Currency exchange</h1>
        <p className="text-sm text-muted-foreground">
          USD out, BDT in. Every taka the agency spends starts here.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ExchangeTable />
      </HydrationBoundary>
    </div>
  );
};

export default ExchangePage;
