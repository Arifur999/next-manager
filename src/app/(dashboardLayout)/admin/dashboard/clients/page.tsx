import ClientsTable from "@/components/modules/Admin/Clients/ClientsTable";
import { getClients } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients",
};

const ClientsPage = async () => {
  const queryClient = new QueryClient();

  // The key carries the search term, and the table starts with an empty one —
  // so this prefetch is the view the table first renders.
  await queryClient.prefetchQuery({
    queryKey: ["clients", ""],
    queryFn: () => getClients(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Everyone the agency bills. Projects, invoices and payments all hang off these.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientsTable />
      </HydrationBoundary>
    </div>
  );
};

export default ClientsPage;
