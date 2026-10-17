import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Task settings",
};

const TaskSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workflowStatusesListQuery("kind=task"));

  return (
    <div className="space-y-6">
      <PageHeader title="Task settings">
        The columns on your task board. Call them what you like — what each one{" "}
        <em>means</em> is chosen separately, and that is what completion dates and the
        reports read.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <WorkflowBoard kind="task" />
      </QueryPrefetch>
    </div>
  );
};

export default TaskSettingsPage;
