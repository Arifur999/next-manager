import ClientDetail from "@/components/modules/Admin/Clients/ClientDetail";
import {
  getClient,
  getClientFinancials,
  getInvoices,
  getPayments,
} from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client",
};

const ClientDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["client", id], queryFn: () => getClient(id) }),
    queryClient.prefetchQuery({
      queryKey: ["client-financials", id],
      queryFn: () => getClientFinancials(id),
    }),
    // These two share their cache keys with the list pages, so navigating here
    // from Payments or Invoices reuses what is already loaded.
    queryClient.prefetchQuery({ queryKey: ["payments", ""], queryFn: () => getPayments() }),
    queryClient.prefetchQuery({ queryKey: ["invoices", ""], queryFn: () => getInvoices() }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientDetail clientId={id} />
    </HydrationBoundary>
  );
};

export default ClientDetailPage;
