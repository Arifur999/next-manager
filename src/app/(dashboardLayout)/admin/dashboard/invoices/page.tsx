import InvoicesTable from "@/components/modules/Admin/Invoices/InvoicesTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { invoicesListQuery } from "@/queries/billing.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Invoices",
};

const InvoicesPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(invoicesListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices">
        Billed in USD. Status follows the payments recorded against each one, so it cannot drift
        from what was actually paid.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <InvoicesTable />
      </QueryPrefetch>
    </div>
  );
};

export default InvoicesPage;
