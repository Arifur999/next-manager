import AdminOverview from "@/components/modules/Dashboard/AdminOverview";
import AgencyKpiBand from "@/components/modules/Dashboard/AgencyKpiBand";
import DashboardOverview from "@/components/modules/Dashboard/DashboardOverview";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { clientsListQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { projectsListQuery } from "@/queries/project.queries";
import { taskReportQuery, workloadQuery } from "@/queries/work.queries";
import { usersListQuery } from "@/queries/people.queries";
import { dashboardQuery } from "@/queries/insights.queries";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Dashboard",
};

const AdminDashboardPage = async () => {
  // Deduped by React cache(), so this costs nothing beyond the call the layout
  // already made in this same request.
  const user = await getUserInfo();


  // Everything both halves of the page read, prefetched together.
  //
  // AdminOverview has to sit INSIDE the hydration boundary below, and this is
  // why: rendered outside it, its useQuery for ["dashboard"] registers an empty
  // entry before hydration runs, hydration then declines to overwrite it, and
  // the analytical half underneath silently renders nothing. Two components
  // reading one key have to share one cache.
  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(dashboardQuery()),
    queryClient.prefetchQuery(taskReportQuery()),
    queryClient.prefetchQuery(workloadQuery()),
    queryClient.prefetchQuery(clientsListQuery("limit=1")),
    queryClient.prefetchQuery(clientsListQuery("status=active&limit=1")),
    queryClient.prefetchQuery(projectsListQuery("limit=1")),
    queryClient.prefetchQuery(usersListQuery("limit=1")),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={<>Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}</>}>
        Where the agency stands today — money held, money owed, and what is due.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        {/* Counts first: what is there, before how it is going. The analytical
            half keeps its place underneath rather than being thrown away. */}
        <AdminOverview />

        <AgencyKpiBand />

        <DashboardOverview />
      </QueryPrefetch>
    </div>
  );
};

export default AdminDashboardPage;
