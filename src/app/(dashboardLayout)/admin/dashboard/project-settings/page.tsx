import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import { getWorkflowStatuses } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Settings",
};

const ProjectSettingsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["workflow-statuses", "project"],
    queryFn: () => getWorkflowStatuses("kind=project"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Project Settings</h1>
        <p className="text-sm text-muted-foreground">
          The states a project moves through. Adding &quot;Review&quot; or
          &quot;Archived&quot; here puts them on the projects list straight away.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkflowBoard kind="project" />
      </HydrationBoundary>
    </div>
  );
};

export default ProjectSettingsPage;
