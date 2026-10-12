import TemplatesBoard from "@/components/modules/Admin/Services/TemplatesBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { serviceTemplatesQuery, servicesListQuery } from "@/queries/catalog.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Service packages",
};

const TemplatesBoardPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(serviceTemplatesQuery()),
    queryClient.prefetchQuery(servicesListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
        <p className="text-sm text-muted-foreground">
          Named bundles, so a repeat offer is one pick rather than five. A package carries no price of its own — what it costs is whatever its lines are sold at on the day.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <TemplatesBoard />
      </QueryPrefetch>
    </div>
  );
};

export default TemplatesBoardPage;
