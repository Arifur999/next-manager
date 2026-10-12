import ClientsTable from "@/components/modules/Admin/Clients/ClientsTable";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import { buildQueryString, pickAllowed } from "@/lib/queryString";
import { CLIENT_STATUSES } from "@/types/crm.types";
import type { Metadata } from "next";
import { clientsListQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Clients",
};

const ClientsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) => {
  const status = pickAllowed((await searchParams).status, CLIENT_STATUSES);
  const user = await getUserInfo();

  // The two the API lets add and edit a client. Operations gets neither, and
  // no row link either: the server returns only the clients whose projects
  // they are on, and knowing WHO they work for is the whole of what they need.
  const canManage = user?.role === "admin" || user?.role === "sales";
  const canOpen = user?.role !== "operations";

  // The filter is read here, not only in the table. Prefetching the
  // unfiltered list while the URL asks for archived paints every client for
  // one frame and then corrects itself — a flash of the wrong answer.
  const query = buildQueryString({ status });

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(clientsListQuery(query));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {status ? `${status[0].toUpperCase()}${status.slice(1)} clients` : "Clients"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {status === "archived"
            ? "Kept, not deleted — their projects, invoices and payments are all still here."
            : "Everyone the agency bills. Projects, invoices and payments all hang off these."}
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <ClientsTable canManage={canManage} canOpen={canOpen} />
      </QueryPrefetch>
    </div>
  );
};

export default ClientsPage;
