import ClientsHeading from "@/components/modules/Admin/Clients/ClientsHeading";
import ClientsTable from "@/components/modules/Admin/Clients/ClientsTable";
import { CLIENTS_TABLE } from "@/components/modules/Admin/Clients/clientsTable.config";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { clientsListQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Clients",
};

const ClientsPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  const [params, user] = await Promise.all([searchParams, getUserInfo()]);

  // The two the API lets add and edit a client. Operations gets neither, and
  // no row link either: the server returns only the clients whose projects
  // they are on, and knowing WHO they work for is the whole of what they need.
  const canManage = user?.role === "admin" || user?.role === "sales";
  const canOpen = user?.role !== "operations";

  // Built from the table's own config, so the prefetched page is exactly the
  // view in the URL and the first paint never shows the wrong list.
  const queryString = buildTableQueryString(params, CLIENTS_TABLE);

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(clientsListQuery(queryString));

  return (
    <div className="space-y-6">
      <ClientsHeading />

      <QueryPrefetch prefetch={prefetch}>
        <ClientsTable canManage={canManage} canOpen={canOpen} />
      </QueryPrefetch>
    </div>
  );
};

export default ClientsPage;
