import TemplatesBoard from "@/components/modules/Admin/Services/TemplatesBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { serviceTemplatesQuery, servicesListQuery } from "@/queries/catalog.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ViewTabs from "@/components/shared/ViewTabs";
import { SERVICE_VIEWS } from "@/lib/pageViews";

export const metadata: Metadata = {
  title: "Packages · Services",
};

const TemplatesBoardPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(serviceTemplatesQuery()),
    queryClient.prefetchQuery(servicesListQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Services">
        Named bundles, so a repeat offer is one pick rather than five. A package carries no price of its own — what it costs is whatever its lines are sold at on the day.
      </PageHeader>
      <ViewTabs label="Catalogue" tabs={SERVICE_VIEWS} />

      <QueryPrefetch prefetch={prefetch}>
        <TemplatesBoard />
      </QueryPrefetch>
    </div>
  );
};

export default TemplatesBoardPage;
