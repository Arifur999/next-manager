import InvoicesTable from "@/components/modules/Admin/Invoices/InvoicesTable";
import { getInvoices } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
};

const InvoicesPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["invoices", ""],
    queryFn: () => getInvoices(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Billed in USD. Status follows the payments recorded against each one, so it cannot drift
          from what was actually paid.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <InvoicesTable />
      </HydrationBoundary>
    </div>
  );
};

export default InvoicesPage;
