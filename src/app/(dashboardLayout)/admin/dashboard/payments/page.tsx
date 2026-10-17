import PaymentsTable from "@/components/modules/Admin/Payments/PaymentsTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { paymentsListQuery } from "@/queries/billing.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Payments",
};

const PaymentsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(paymentsListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Payments">
        Money in from clients. Always USD — BDT only appears once you exchange.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <PaymentsTable />
      </QueryPrefetch>
    </div>
  );
};

export default PaymentsPage;
