import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import { onlyPaying, PAYING_COMPANIES_TABLE } from "@/components/modules/Platform/companiesTable.config";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import { companiesListQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paying companies",
};

const PayingCompaniesPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  const queryString = onlyPaying(buildTableQueryString(await searchParams, PAYING_COMPANIES_TABLE));
  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(companiesListQuery(queryString));

  return (
    <div className="space-y-6">
      <PageHeader title="Paying companies">Companies on a paid plan. Trials are listed under Companies.</PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <CustomersBoard payingOnly />
      </QueryPrefetch>
    </div>
  );
};

export default PayingCompaniesPage;
