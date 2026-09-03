import ServicesBoard from "@/components/modules/Admin/Services/ServicesBoard";
import { getServiceCategories, getServices } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
};

const ServicesPage = async () => {
  const queryClient = new QueryClient();
  const user = await getUserInfo();

  // The same two the API lets write the catalogue. A project manager reads
  // it to pick what a project delivers; shaping it is the seller's job, and
  // a form that always failed would only teach them the app is broken.
  const canManage = user?.role === "admin" || user?.role === "sales";

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
        <ServicesBoard canManage={canManage} />
      </HydrationBoundary>
    </div>
  );
};

export default ServicesPage;
