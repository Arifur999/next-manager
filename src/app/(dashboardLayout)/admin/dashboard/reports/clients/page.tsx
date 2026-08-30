import ClientsReport from "@/components/modules/Admin/Reports/ClientsReport";
import { getClientRevenue } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client report",
};

const ClientsReportPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["report-client-revenue"],
      queryFn: () => getClientRevenue(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Who actually pays. Money received, not money invoiced — an unpaid invoice is a hope, and ranking clients by what they were billed would put your worst payer at the top.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientsReport />
      </HydrationBoundary>
    </div>
  );
};

export default ClientsReportPage;
