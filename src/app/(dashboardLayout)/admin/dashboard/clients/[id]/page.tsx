import ClientDetail from "@/components/modules/Admin/Clients/ClientDetail";
import { getInvoices, getPayments } from "@/services/billing.services";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { clientDetailQuery, clientFinancialsQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Client",
};

const ClientDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const user = await getUserInfo();

  // /clients/:id/financials and /payments are admin-only. Sales manages the
  // relationship, not the money it brings in, so the page stops asking rather
  // than rendering three panels that come back refused.
  const canSeeMoney = user?.role === "admin";

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(clientDetailQuery(id)),
    ...(canSeeMoney
      ? [
          queryClient.prefetchQuery(clientFinancialsQuery(id)),
          // These two share their cache keys with the list pages, so navigating
          // here from Payments or Invoices reuses what is already loaded.
          queryClient.prefetchQuery({ queryKey: ["payments", ""], queryFn: () => getPayments() }),
          queryClient.prefetchQuery({ queryKey: ["invoices", ""], queryFn: () => getInvoices() }),
        ]
      : []),
  ]);

  return (
    <QueryPrefetch prefetch={prefetch}>
      <ClientDetail clientId={id} canSeeMoney={canSeeMoney} />
    </QueryPrefetch>
  );
};

export default ClientDetailPage;
