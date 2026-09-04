import AdminOverview from "@/components/modules/Dashboard/AdminOverview";
import AgencyKpiBand from "@/components/modules/Dashboard/AgencyKpiBand";
import DashboardOverview from "@/components/modules/Dashboard/DashboardOverview";
import {
  getClients,
  getDashboard,
  getProjects,
  getTaskReport,
  getWorkload,
} from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const AdminDashboardPage = async () => {
  // Deduped by React cache(), so this costs nothing beyond the call the layout
  // already made in this same request.
  const user = await getUserInfo();

  const queryClient = new QueryClient();

  // Everything both halves of the page read, prefetched together.
  //
  // AdminOverview has to sit INSIDE the hydration boundary below, and this is
  // why: rendered outside it, its useQuery for ["dashboard"] registers an empty
  // entry before hydration runs, hydration then declines to overwrite it, and
  // the analytical half underneath silently renders nothing. Two components
  // reading one key have to share one cache.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: () => getDashboard(),
      staleTime: 1000 * 30,
    }),
    queryClient.prefetchQuery({ queryKey: ["task-report"], queryFn: () => getTaskReport() }),
    queryClient.prefetchQuery({ queryKey: ["workload"], queryFn: () => getWorkload() }),
    queryClient.prefetchQuery({
      queryKey: ["clients", "count"],
      queryFn: () => getClients("limit=1"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["clients", "count", "active"],
      queryFn: () => getClients("status=active&limit=1"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["projects", "count"],
      queryFn: () => getProjects("limit=1"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["users", "count"],
      queryFn: () => getAllUsers("limit=1"),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Where the agency stands today — money held, money owed, and what is due.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* Counts first: what is there, before how it is going. The analytical
            half keeps its place underneath rather than being thrown away. */}
        <AdminOverview />

        <AgencyKpiBand />

        <DashboardOverview />
      </HydrationBoundary>
    </div>
  );
};

export default AdminDashboardPage;
