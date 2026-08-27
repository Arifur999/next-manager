import TeamTable from "@/components/modules/Admin/TeamManagement/TeamTable";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management",
};

const TeamManagementPage = async () => {
  const queryClient = new QueryClient();

  // Prefetched here and consumed by the client table under the SAME query key,
  // so the table renders populated on first paint instead of flashing empty.
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
    staleTime: 1000 * 60,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
        <p className="text-sm text-muted-foreground">
          Invite colleagues into this workspace and control what each of them can reach.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamTable />
      </HydrationBoundary>
    </div>
  );
};

export default TeamManagementPage;
