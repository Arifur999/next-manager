import TemplatesBoard from "@/components/modules/Admin/Services/TemplatesBoard";
import { getServiceTemplates, getServices } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service packages",
};

const TemplatesBoardPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["service-templates"], queryFn: () => getServiceTemplates() }),
    queryClient.prefetchQuery({ queryKey: ["services"], queryFn: () => getServices() }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
        <p className="text-sm text-muted-foreground">
          Named bundles, so a repeat offer is one pick rather than five. A package carries no price of its own — what it costs is whatever its lines are sold at on the day.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TemplatesBoard />
      </HydrationBoundary>
    </div>
  );
};

export default TemplatesBoardPage;
