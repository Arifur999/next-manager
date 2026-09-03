import ServiceDetail from "@/components/modules/Admin/Services/ServiceDetail";
import { getService } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service",
};

const ServiceDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["service", id],
    queryFn: () => getService(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServiceDetail serviceId={id} />
    </HydrationBoundary>
  );
};

export default ServiceDetailPage;
