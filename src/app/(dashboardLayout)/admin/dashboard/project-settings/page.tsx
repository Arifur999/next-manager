import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Project Settings",
};

const ProjectSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workflowStatusesListQuery("kind=project"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Project Settings</h1>
        <p className="text-sm text-muted-foreground">
          The states a project moves through. Adding &quot;Review&quot; or
          &quot;Archived&quot; here puts them on the projects list straight away.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <WorkflowBoard kind="project" />
      </QueryPrefetch>
    </div>
  );
};

export default ProjectSettingsPage;
