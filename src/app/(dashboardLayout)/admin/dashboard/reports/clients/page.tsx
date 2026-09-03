import ClientsReport from "@/components/modules/Admin/Reports/ClientsReport";
import { getClientRevenue } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client report",
};

const ClientsReportPage = async () => {
  const queryClient = new QueryClient();

  const [user] = await Promise.all([
    getUserInfo(),
    queryClient.prefetchQuery({
      queryKey: ["report-client-revenue"],
      queryFn: () => getClientRevenue(),
    }),
  ]);

  // Only the wording changes here. The narrowing is done by the server,
  // which forces it for a salesperson rather than reading it from a query -
  // a page cannot be trusted to ask for less than it is allowed.
  const mine = user?.role === "sales";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mine ? "Your clients" : "Clients"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mine
            ? "What the clients you brought in have actually paid. Money received, not money invoiced — an unpaid invoice is a hope, and ranking clients by what they were billed would put your worst payer at the top."
            : "Who actually pays. Money received, not money invoiced — an unpaid invoice is a hope, and ranking clients by what they were billed would put your worst payer at the top."}
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientsReport />
      </HydrationBoundary>
    </div>
  );
};

export default ClientsReportPage;
