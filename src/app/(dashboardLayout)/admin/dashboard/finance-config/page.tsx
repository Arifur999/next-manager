import FinanceConfiguration from "@/components/modules/Admin/Settings/FinanceConfiguration";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { rateSettingsQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { expenseCategoriesQuery } from "@/queries/spending.queries";

export const metadata: Metadata = {
  title: "Finance Configuration",
};

const FinanceConfigurationPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(rateSettingsQuery()),
    queryClient.prefetchQuery(expenseCategoriesQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance Configuration</h1>
        <p className="text-sm text-muted-foreground">
          How this agency counts money: what a dollar is worth in the reports, and what a
          cost gets counted as.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <FinanceConfiguration />
      </QueryPrefetch>
    </div>
  );
};

export default FinanceConfigurationPage;
