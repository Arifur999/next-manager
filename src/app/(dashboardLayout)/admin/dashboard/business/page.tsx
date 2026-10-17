import { site } from "@/data/site"
import BusinessProfile from "@/components/modules/Admin/Settings/BusinessProfile";
import SubscriptionPanel from "@/components/modules/Admin/Settings/SubscriptionPanel";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { organizationQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Business information",
};

const BusinessInformationPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(organizationQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Business information">
        Who the agency is on paper, and what it is on {site.name}.
      </PageHeader>

      {/* Above the details: when a limit refuses something, this is the panel
          the message is pointing at. */}
      <SubscriptionPanel />

      <QueryPrefetch prefetch={prefetch}>
        <BusinessProfile />
      </QueryPrefetch>
    </div>
  );
};

export default BusinessInformationPage;
