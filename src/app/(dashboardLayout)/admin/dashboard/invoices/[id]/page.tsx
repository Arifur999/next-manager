import InvoiceDetail from "@/components/modules/Admin/Invoices/InvoiceDetail";
import { getInvoice } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice",
};

const InvoiceDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
    staleTime: 1000 * 30,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoiceDetail invoiceId={id} />
    </HydrationBoundary>
  );
};

export default InvoiceDetailPage;
