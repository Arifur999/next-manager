import InvoiceDetail from "@/components/modules/Admin/Invoices/InvoiceDetail";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { invoiceDetailQuery } from "@/queries/billing.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Invoice",
};

const InvoiceDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(invoiceDetailQuery(id));

  return (
    <QueryPrefetch prefetch={prefetch}>
      <InvoiceDetail invoiceId={id} />
    </QueryPrefetch>
  );
};

export default InvoiceDetailPage;
