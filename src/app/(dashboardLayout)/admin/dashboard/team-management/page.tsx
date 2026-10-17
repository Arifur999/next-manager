import AssignmentOverview from "@/components/modules/Admin/Team/AssignmentOverview";
import CapacityPanel from "@/components/modules/Admin/Team/CapacityPanel";
import InvitesPanel from "@/components/modules/Admin/TeamManagement/InvitesPanel";
import PendingApprovals from "@/components/modules/Admin/TeamManagement/PendingApprovals";
import TeamTable from "@/components/modules/Admin/TeamManagement/TeamTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { assignmentOverviewQuery } from "@/queries/project.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { departmentsQuery, usersListQuery } from "@/queries/people.queries";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Team",
};

const TeamManagementPage = async () => {

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(usersListQuery()),
    // Without this the department filter pops in after hydration, and the
    // first paint of the team list has no way to be filtered.
    queryClient.prefetchQuery(departmentsQuery()),
    queryClient.prefetchQuery(assignmentOverviewQuery()),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Team">
        Who is in the agency, what they may reach, and what they are working on.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
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
      </QueryPrefetch>
    </div>
  );
};

export default TeamManagementPage;
