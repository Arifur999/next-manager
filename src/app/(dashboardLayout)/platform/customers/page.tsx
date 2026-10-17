import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import { COMPANIES_TABLE } from "@/components/modules/Platform/companiesTable.config";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { buildTableQueryString, type SearchParamsRecord } from "@/lib/table/urlState";
import { companiesListQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies",
};

const CompaniesPage = async ({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) => {
  // Built from the table's own config, so the first paint is exactly the view in the URL.
  const queryString = buildTableQueryString(await searchParams, COMPANIES_TABLE);
  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(companiesListQuery(queryString));

  return (
    <div className="space-y-6">
      <PageHeader title="Companies">Every company on the platform and the person it was sold to.</PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <CustomersBoard />
      </QueryPrefetch>
    </div>
  );
};

export default CompaniesPage;
