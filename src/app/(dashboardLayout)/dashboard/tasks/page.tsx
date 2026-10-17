import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "My Tasks",
};

// The same board, scoped to the signed-in person. The server narrows a member
// to their own tasks anyway; ?mine=true makes it explicit for everyone else.
//
// Five views over it - all of it, today's, the next seven days, late, and
// finished - each a filter off the URL rather than a page of its own.
type MyTasksSearchParams = { due?: string; overdue?: string; completed?: string };

const HEADINGS = {
  overdue: { title: "Overdue", blurb: "Past their date and still open. Finishing one takes it off this list." },
  today: { title: "Due today", blurb: "Everything you owe today." },
  upcoming: { title: "Upcoming", blurb: "The next seven days — a week of work, not a backlog." },
  completed: {
    title: "Completed",
    blurb: "Work you have finished. Read by what a status means, so renaming a column does not empty this.",
  },
  all: { title: "My tasks", blurb: "Work assigned to you." },
};

// The sidebar's links can combine; the first match names the page.
const headingFor = (params: MyTasksSearchParams) => {
  if (params.overdue === "true") return HEADINGS.overdue;
  if (params.due === "today") return HEADINGS.today;
  if (params.due === "upcoming") return HEADINGS.upcoming;
  if (params.completed === "true") return HEADINGS.completed;
  return HEADINGS.all;
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

  const heading = headingFor(params);

  return (
    <div className="space-y-6">
      <PageHeader title={heading.title}>{heading.blurb}</PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard mineOnly />
      </QueryPrefetch>
    </div>
  );
};

export default MyTasksPage;
