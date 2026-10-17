import PlatformCharts from "@/components/modules/Platform/PlatformCharts";
import PlatformOverview from "@/components/modules/Platform/PlatformOverview";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { platformOverviewQuery, platformTrendQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

// Fetched before the first paint, so the tiles and lists arrive at their real height.
const prefetch = (queryClient: QueryClient) =>
  Promise.all([queryClient.prefetchQuery(platformOverviewQuery()), queryClient.prefetchQuery(platformTrendQuery())]);

// Where the platform owner lands: how the business is doing and what needs doing this week.
const PlatformPage = () => (
  <div className="space-y-6">
    <PageHeader title="Overview">How the platform is doing and what needs doing this week.</PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <PlatformOverview />
      <PlatformCharts />
    </QueryPrefetch>
  </div>
);

export default PlatformPage;
