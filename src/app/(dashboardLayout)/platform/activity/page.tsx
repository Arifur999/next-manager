import PlatformActivityFeed from "@/components/modules/Platform/PlatformActivityFeed";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { platformActivityFeedQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity log",
};

// The unfiltered first page, the same key the feed builds with no filter picked.
const prefetch = (queryClient: QueryClient) =>
  queryClient.prefetchInfiniteQuery(platformActivityFeedQuery({ entity_type: undefined }));

const ActivityLogPage = () => (
  <div className="space-y-6">
    <PageHeader title="Activity log">
      Everything the platform team has done, as recorded at the time. Entries cannot be edited or removed.
    </PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <PlatformActivityFeed />
    </QueryPrefetch>
  </div>
);

export default ActivityLogPage;
