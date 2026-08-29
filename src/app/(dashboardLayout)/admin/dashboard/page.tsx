import AgencyKpiBand from "@/components/modules/Dashboard/AgencyKpiBand";
import DashboardOverview from "@/components/modules/Dashboard/DashboardOverview";
import { getDashboard } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
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
  await queryClient.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    staleTime: 1000 * 30,
  });

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

      <AgencyKpiBand />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardOverview />
      </HydrationBoundary>
    </div>
  );
};

export default AdminDashboardPage;
