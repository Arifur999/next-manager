import ServiceDetail from "@/components/modules/Admin/Services/ServiceDetail";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { serviceDetailQuery } from "@/queries/catalog.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Service",
};

const ServiceDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(serviceDetailQuery(id));

  return (
    <QueryPrefetch prefetch={prefetch}>
      <ServiceDetail serviceId={id} />
    </QueryPrefetch>
  );
};

export default ServiceDetailPage;
