import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery } from "@/queries/work.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "My Tasks",
};

// The same board, scoped to the signed-in person. The server narrows a member
// to their own tasks anyway; ?mine=true makes it explicit for everyone else.
//
// Five views over it - all of it, today's, the next seven days, late, and
// finished - each a filter off the URL rather than a page of its own.
const MyTasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ due?: string; overdue?: string; completed?: string }>;
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

  const title =
    params.overdue === "true"
      ? "Overdue"
      : params.due === "today"
        ? "Due today"
        : params.due === "upcoming"
          ? "Upcoming"
          : params.completed === "true"
            ? "Completed"
            : "My tasks";

  const blurb =
    params.overdue === "true"
      ? "Past their date and still open. Finishing one takes it off this list."
      : params.due === "today"
        ? "Everything you owe today."
        : params.due === "upcoming"
          ? "The next seven days — a week of work, not a backlog."
          : params.completed === "true"
            ? "Work you have finished. Read by what a status means, so renaming a column does not empty this."
            : "Work assigned to you.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{blurb}</p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard mineOnly />
      </QueryPrefetch>
    </div>
  );
};

export default MyTasksPage;
