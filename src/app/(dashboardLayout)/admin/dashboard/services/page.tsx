import ServicesBoard from "@/components/modules/Admin/Services/ServicesBoard";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { serviceCategoriesQuery, servicesListQuery } from "@/queries/catalog.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Services",
};

const ServicesPage = async () => {
  const user = await getUserInfo();

  // The same two the API lets write the catalogue. A project manager reads
  // it to pick what a project delivers; shaping it is the seller's job, and
  // a form that always failed would only teach them the app is broken.
  const canManage = user?.role === "admin" || user?.role === "sales";

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(servicesListQuery()),
    queryClient.prefetchQuery(serviceCategoriesQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Services">
        What the agency sells. Picked from when raising an invoice or opening a project,
        which is what makes &quot;what does SEO actually earn us&quot; answerable.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <ServicesBoard canManage={canManage} />
      </QueryPrefetch>
    </div>
  );
};

export default ServicesPage;
