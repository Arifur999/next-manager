import TasksReport from "@/components/modules/Admin/Reports/TasksReport";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { taskReportQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ReportViewTabs from "@/components/modules/Admin/Reports/ReportViewTabs";
import ReportPeriodPicker from "@/components/modules/Admin/Reports/ReportPeriodPicker";
import { periodQueryString } from "@/lib/reportPeriod";

export const metadata: Metadata = {
  title: "Tasks · Reports",
};

const TasksReportPage = async ({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  // The same from/to the period picker writes, so the prefetch lands on the key the cards ask for.
  const period = periodQueryString(await searchParams);

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(taskReportQuery(period));

  return (
    <div className="space-y-6">
      <PageHeader title="Reports">
        The board, added up. Every figure here is already on it — this page exists so
        nobody has to count four columns by eye. Done and overdue are decided by what a
        status means, not by what it is called, so renaming a column does not break the
        count.
      </PageHeader>
      <ReportViewTabs />
      <ReportPeriodPicker />

      <QueryPrefetch prefetch={prefetch}>
        <TasksReport period={period} />
      </QueryPrefetch>
    </div>
  );
};

export default TasksReportPage;
