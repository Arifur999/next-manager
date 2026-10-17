import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import ViewTabs from "@/components/shared/ViewTabs";
import { MY_TASK_VIEWS } from "@/lib/pageViews";

export const metadata: Metadata = {
  title: "Tasks",
};

// The same board, scoped to the signed-in person. The server narrows a member
// to their own tasks anyway; ?mine=true makes it explicit for everyone else.
//
// Five views over it - all of it, today's, the next seven days, late, and
// finished - each a filter off the URL rather than a page of its own.
type MyTasksSearchParams = { due?: string; overdue?: string; completed?: string };

// The title stays "Tasks", the sidebar's word; the tab says which view, and
// this line says what the view is for.
const BLURBS = {
  overdue: "Past their date and still open. Finishing one takes it off this list.",
  today: "Everything you owe today.",
  upcoming: "The next seven days — a week of work, not a backlog.",
  completed: "Work you have finished. Read by what a status means, so renaming a column does not empty this.",
  all: "Work assigned to you.",
};

// Old links can combine filters; the first match describes the page.
const blurbFor = (params: MyTasksSearchParams) => {
  if (params.overdue === "true") return BLURBS.overdue;
  if (params.due === "today") return BLURBS.today;
  if (params.due === "upcoming") return BLURBS.upcoming;
  if (params.completed === "true") return BLURBS.completed;
  return BLURBS.all;
};

const MyTasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<MyTasksSearchParams>;
}) => {
  const params = await searchParams;

  // Built the same way the board builds it, so the first paint is the view that
  // was asked for rather than every task followed by a correction.
  const query = [
    "mine=true",
    params.overdue === "true" ? "overdue=true" : "",
    params.due === "today" || params.due === "upcoming" ? `due=${params.due}` : "",
    params.completed === "true" ? "completed=true" : "",
  ]
    .filter(Boolean)
    .join("&");

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(tasksListQuery(query));

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks">{blurbFor(params)}</PageHeader>
      <ViewTabs label="Task views" tabs={MY_TASK_VIEWS} />

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard mineOnly />
      </QueryPrefetch>
    </div>
  );
};

export default MyTasksPage;
