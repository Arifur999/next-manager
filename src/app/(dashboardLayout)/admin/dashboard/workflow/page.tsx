import WorkflowBoard from "@/components/modules/Admin/Workflow/WorkflowBoard";
import { getWorkflowStatuses } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Settings",
};

const TaskSettingsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["workflow-statuses", "task"],
    queryFn: () => getWorkflowStatuses("kind=task"),
  });

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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkflowBoard kind="task" />
      </HydrationBoundary>
    </div>
  );
};

export default TaskSettingsPage;
