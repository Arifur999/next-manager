import ServicesBoard from "@/components/modules/Admin/Services/ServicesBoard";
import { getServiceCategories, getServices } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
};

const ServicesPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["services"], queryFn: () => getServices() }),
    queryClient.prefetchQuery({
      queryKey: ["service-categories"],
      queryFn: () => getServiceCategories(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        <p className="text-sm text-muted-foreground">
          What the agency sells. Picked from when raising an invoice or opening a project,
          which is what makes &quot;what does SEO actually earn us&quot; answerable.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ServicesBoard />
      </HydrationBoundary>
    </div>
  );
};

export default ServicesPage;
