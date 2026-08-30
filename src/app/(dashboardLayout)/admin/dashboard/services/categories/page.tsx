import CategoriesBoard from "@/components/modules/Admin/Services/CategoriesBoard";
import { getServiceCategories } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service categories",
};

const CategoriesBoardPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["service-categories"],
      queryFn: () => getServiceCategories(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          How the catalogue is grouped. Removing a category leaves its services in place, ungrouped — grouping is a tidying decision, not a thing to lose work over.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoriesBoard />
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesBoardPage;
