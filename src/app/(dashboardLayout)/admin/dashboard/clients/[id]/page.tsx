import ClientDetail from "@/components/modules/Admin/Clients/ClientDetail";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { clientDetailQuery, clientFinancialsQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { invoicesListQuery, paymentsListQuery } from "@/queries/billing.queries";

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
  const role = user?.role;
  // The rest follow the API's role gates for each write.
  const canEdit = role === "admin" || role === "sales";
  const canAddProject = canEdit || role === "project_manager";

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(clientDetailQuery(id)),
    ...(canSeeMoney
      ? [
          queryClient.prefetchQuery(clientFinancialsQuery(id)),
          // These two share their cache keys with the list pages, so navigating
          // here from Payments or Invoices reuses what is already loaded.
          queryClient.prefetchQuery(paymentsListQuery()),
          queryClient.prefetchQuery(invoicesListQuery()),
        ]
      : []),
  ]);

  return (
    <QueryPrefetch prefetch={prefetch}>
      <ClientDetail
        clientId={id}
        canSeeMoney={canSeeMoney}
        canEdit={canEdit}
        canAddProject={canAddProject}
        canRaiseInvoice={canEdit}
        canManageLinks={canAddProject}
        canOpenVault={canAddProject}
      />
    </QueryPrefetch>
  );
};

export default ClientDetailPage;
