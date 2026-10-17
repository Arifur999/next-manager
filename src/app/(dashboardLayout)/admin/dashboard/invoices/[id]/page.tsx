import InvoiceDetail from "@/components/modules/Admin/Invoices/InvoiceDetail";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { isMissingRecordError } from "@/lib/apiFailure";
import { invoiceDetailQuery } from "@/queries/billing.queries";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Invoice",
};

const InvoiceDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, user] = await Promise.all([params, getUserInfo()]);

  // Sales raises and corrects invoices; what was actually paid is a finance
  // record, and the payments API is admin-only.
  const canRecordPayment = user?.role === "admin";

  // The server read does not retry, so its error is the API's answer: an
  // unknown, foreign or malformed id is "not found", not an outage to retry.
  const prefetch = async (queryClient: QueryClient) => {
    const query = invoiceDetailQuery(id);
    await queryClient.prefetchQuery(query);
    if (isMissingRecordError(queryClient.getQueryState(query.queryKey)?.error)) notFound();
  };

  return (
    <QueryPrefetch prefetch={prefetch}>
      <InvoiceDetail invoiceId={id} canRecordPayment={canRecordPayment} />
    </QueryPrefetch>
  );
};

export default InvoiceDetailPage;
