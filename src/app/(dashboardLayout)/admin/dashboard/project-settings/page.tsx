import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Project Settings",
};

const ProjectSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workflowStatusesListQuery("kind=project"));

  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings">
        The states a project moves through. Adding &quot;Review&quot; or
        &quot;Archived&quot; here puts them on the projects list straight away.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <WorkflowBoard kind="project" />
      </QueryPrefetch>
    </div>
  );
};

export default ProjectSettingsPage;
