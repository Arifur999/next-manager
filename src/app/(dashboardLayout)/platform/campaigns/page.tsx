import CampaignBoard from "@/components/modules/Platform/CampaignBoard";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { announcementsQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns",
};

const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(announcementsQuery());

const CampaignsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Campaigns">
      Notices that appear in your customers&apos; notification bell, and can be emailed as well.
    </PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <CampaignBoard />
    </QueryPrefetch>
  </div>
);

export default CampaignsPage;
