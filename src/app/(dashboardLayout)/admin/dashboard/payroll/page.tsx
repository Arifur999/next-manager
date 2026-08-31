import PayrollBoard from "@/components/modules/Admin/People/PayrollBoard";
import { getAccounts, getPayrollRuns } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payroll",
};

const PayrollPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["payroll"], queryFn: () => getPayrollRuns() }),
    queryClient.prefetchQuery({ queryKey: ["accounts"], queryFn: () => getAccounts() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">
          A month at a time. Paying a run writes one team payout per person and moves the
          money out of a real account — salary is recorded in one place only, which is why
          every profit figure in the product already agrees with it.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PayrollBoard />
      </HydrationBoundary>
    </div>
  );
};

export default PayrollPage;
