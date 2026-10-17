import FinanceConfiguration from "@/components/modules/Admin/Settings/FinanceConfiguration";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { rateSettingsQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { expenseCategoriesQuery } from "@/queries/spending.queries";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Finance configuration",
};

const FinanceConfigurationPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(rateSettingsQuery()),
    queryClient.prefetchQuery(expenseCategoriesQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Finance configuration">
        How this agency counts money: what a dollar is worth in the reports, and what a
        cost gets counted as.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <FinanceConfiguration />
      </QueryPrefetch>
    </div>
  );
};

export default FinanceConfigurationPage;
