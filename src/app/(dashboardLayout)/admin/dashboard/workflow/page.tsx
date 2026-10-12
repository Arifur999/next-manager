import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { workflowStatusesListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Task Settings",
};

const TaskSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(workflowStatusesListQuery("kind=task"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Task Settings</h1>
        <p className="text-sm text-muted-foreground">
          The columns on your task board. Call them what you like — what each one{" "}
          <em>means</em> is chosen separately, and that is what completion dates and the
          reports read.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <WorkflowBoard kind="task" />
      </QueryPrefetch>
    </div>
  );
};

export default TaskSettingsPage;
