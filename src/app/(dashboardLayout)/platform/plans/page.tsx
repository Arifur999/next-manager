import { COMPANIES_TABLE } from "@/components/modules/Platform/companiesTable.config";
import { plansPageTab } from "@/components/modules/Platform/plansPageTab";
import PlansTabs from "@/components/modules/Platform/PlansTabs";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import { companiesListQuery, plansQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans",
};

// Plans and the companies on them stay together: changing a tier and moving a
// customer onto it are the same job, done minutes apart.
const PlansPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  const params = await searchParams;

  // Only the open tab's list is fetched ahead, so the first paint has no skeleton.
  const prefetch = (queryClient: QueryClient) =>
    Promise.all([
      queryClient.prefetchQuery(plansQuery()),
      plansPageTab(params.tab) === "assignments"
        ? queryClient.prefetchQuery(companiesListQuery(buildTableQueryString(params, COMPANIES_TABLE)))
        : undefined,
    ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Plans">The tiers you sell and which company is on each one.</PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <PlansTabs />
      </QueryPrefetch>
    </div>
  );
};

export default PlansPage;
