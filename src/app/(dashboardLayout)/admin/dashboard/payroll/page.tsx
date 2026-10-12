import PayrollBoard from "@/components/modules/Admin/People/PayrollBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { accountsQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { payrollRunsQuery } from "@/queries/people.queries";

export const metadata: Metadata = {
  title: "Payroll",
};

const PayrollPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(payrollRunsQuery()),
    queryClient.prefetchQuery(accountsQuery()),
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

      <QueryPrefetch prefetch={prefetch}>
        <PayrollBoard />
      </QueryPrefetch>
    </div>
  );
};

export default PayrollPage;
