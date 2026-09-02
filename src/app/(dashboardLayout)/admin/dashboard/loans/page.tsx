import LoansBoard from "@/components/modules/Admin/Loans/LoansBoard";
import { getAccounts, getLoanSummary, getLoans } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loans",
};

const LoansPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["loans"], queryFn: () => getLoans() }),
    queryClient.prefetchQuery({ queryKey: ["loan-summary"], queryFn: () => getLoanSummary() }),
    queryClient.prefetchQuery({ queryKey: ["accounts"], queryFn: () => getAccounts() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loans</h1>
        <p className="text-sm text-muted-foreground">
          Bank loans and EMIs — money lent between people belongs on Due Payments
          instead. Borrowed cash lands in a real account but is never revenue, and
          repaying it is only partly a cost: the principal was already owed, so only the
          interest counts against your profit.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LoansBoard />
      </HydrationBoundary>
    </div>
  );
};

export default LoansPage;
