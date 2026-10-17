import TasksReport from "@/components/modules/Admin/Reports/TasksReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { taskReportQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Task report",
};

const TasksReportPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(taskReportQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks">
        The board, added up. Every figure here is already on it — this page exists so
        nobody has to count four columns by eye. Done and overdue are decided by what a
        status means, not by what it is called, so renaming a column does not break the
        count.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <TasksReport />
      </QueryPrefetch>
    </div>
  );
};

export default TasksReportPage;
