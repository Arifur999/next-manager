import TasksReport from "@/components/modules/Admin/Reports/TasksReport";
import { getTaskReport } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task report",
};

const TasksReportPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["task-report"],
    queryFn: () => getTaskReport(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          The board, added up. Every figure here is already on it — this page exists so
          nobody has to count four columns by eye. Done and overdue are decided by what a
          status means, not by what it is called, so renaming a column does not break the
          count.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TasksReport />
      </HydrationBoundary>
    </div>
  );
};

export default TasksReportPage;
