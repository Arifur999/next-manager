import AssignmentOverview from "@/components/modules/Admin/Team/AssignmentOverview";
import CapacityPanel from "@/components/modules/Admin/Team/CapacityPanel";
import InvitesPanel from "@/components/modules/Admin/TeamManagement/InvitesPanel";
import PendingApprovals from "@/components/modules/Admin/TeamManagement/PendingApprovals";
import TeamTable from "@/components/modules/Admin/TeamManagement/TeamTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAssignmentOverview, getDepartments } from "@/services/agencio.services";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
};

const TeamManagementPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["users", ""], queryFn: () => getAllUsers() }),
    // Without this the department filter pops in after hydration, and the
    // first paint of the team list has no way to be filtered.
    queryClient.prefetchQuery({ queryKey: ["departments"], queryFn: () => getDepartments() }),
    queryClient.prefetchQuery({
      queryKey: ["assignment-overview"],
      queryFn: () => getAssignmentOverview(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Who is in the agency, what they may reach, and what they are working on.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members &amp; roles</TabsTrigger>
            <TabsTrigger value="assignments">Project assignments</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="capacity">Capacity &amp; rates</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4 space-y-4">
            {/* Above the table: it is the thing on this screen that needs
                doing, and below it nobody would find it. */}
            <PendingApprovals />
            <TeamTable />
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <AssignmentOverview />
          </TabsContent>

          <TabsContent value="invites" className="mt-4">
            <InvitesPanel />
          </TabsContent>

          <TabsContent value="capacity" className="mt-4">
            <CapacityPanel />
          </TabsContent>
        </Tabs>
      </HydrationBoundary>
    </div>
  );
};

export default TeamManagementPage;
