import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getUserInfo } from "@/services/auth.services";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery, workflowStatusesListQuery } from "@/queries/work.queries";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Tasks",
};

type TasksSearchParams = {
  mine?: string;
  overdue?: string;
  view?: string;
  client_owner?: string;
};

const HEADINGS = {
  overdue: {
    title: "Overdue tasks",
    blurb: "Past their date and still unfinished. Finishing one takes it off this list.",
  },
  sales: {
    title: "Sales tasks",
    blurb:
      "Everything happening inside the clients you brought in — whoever is doing it. Watching, not running: the work belongs to whoever the project manager gave it to.",
  },
  mine: { title: "My tasks", blurb: "Assigned to you." },
  all: { title: "Tasks", blurb: "Everything in flight, in the order work moves through." },
};

// The sidebar's links can combine; the first match names the page.
const headingFor = (params: TasksSearchParams) => {
  if (params.overdue === "true") return HEADINGS.overdue;
  if (params.client_owner === "me") return HEADINGS.sales;
  if (params.mine === "true") return HEADINGS.mine;
  return HEADINGS.all;
};

const TasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<TasksSearchParams>;
}) => {
  const params = await searchParams;

  // Built the same way the board builds it, so the first paint is the view
  // that was asked for rather than every task followed by a correction.
  const query = [
    params.mine === "true" ? "mine=true" : "",
    params.overdue === "true" ? "overdue=true" : "",
    params.client_owner === "me" ? "client_owner=me" : "",
  ]
    .filter(Boolean)
    .join("&");

  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(tasksListQuery(query)),
    // The board draws its COLUMNS from these, so without them the server
    // renders a board with no columns and therefore no tasks — everything
    // appearing only once the browser has hydrated and fetched them. The list
    // and calendar views never showed it because they read tasks directly.
    queryClient.prefetchQuery(workflowStatusesListQuery("kind=task")),
  ]);

  // The two roles that own the schedule. Sales reads this board; the API
  // refuses them every write behind it, so the create button would only be a
  // button that fails.
  const canManage = user?.role === "admin" || user?.role === "project_manager";

  const heading = headingFor(params);

  return (
    <div className="space-y-6">
      <PageHeader title={heading.title}>{heading.blurb}</PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard canManage={canManage} />
      </QueryPrefetch>
    </div>
  );
};

export default TasksPage;
