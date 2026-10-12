import CategoriesBoard from "@/components/modules/Admin/Services/CategoriesBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { serviceCategoriesQuery } from "@/queries/catalog.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Service categories",
};

const CategoriesBoardPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(serviceCategoriesQuery()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          How the catalogue is grouped. Removing a category leaves its services in place, ungrouped — grouping is a tidying decision, not a thing to lose work over.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <CategoriesBoard />
      </QueryPrefetch>
    </div>
  );
};

export default CategoriesBoardPage;
