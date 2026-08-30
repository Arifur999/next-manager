import FinanceConfiguration from "@/components/modules/Admin/Settings/FinanceConfiguration";
import { getExpenseCategories, getRateSettings } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance Configuration",
};

const FinanceConfigurationPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["rate-settings"], queryFn: () => getRateSettings() }),
    queryClient.prefetchQuery({
      queryKey: ["expense-categories"],
      queryFn: () => getExpenseCategories(),
    }),
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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <FinanceConfiguration />
      </HydrationBoundary>
    </div>
  );
};

export default FinanceConfigurationPage;
