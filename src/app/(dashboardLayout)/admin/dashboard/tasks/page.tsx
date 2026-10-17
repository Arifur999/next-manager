import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getUserInfo } from "@/services/auth.services";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { tasksListQuery, workflowStatusesListQuery } from "@/queries/work.queries";
import PageHeader from "@/components/shared/PageHeader";
import ViewTabs from "@/components/shared/ViewTabs";
import { taskViewsFor } from "@/lib/pageViews";
import { toUserRole } from "@/types/user.types";

export const metadata: Metadata = {
  title: "Tasks",
};

type TasksSearchParams = {
  mine?: string;
  overdue?: string;
  view?: string;
  client_owner?: string;
};

// The title stays "Tasks", the sidebar's word; the tab says which view, and
// this line says what the view is for.
const BLURBS = {
  overdue: "Past their date and still unfinished. Finishing one takes it off this list.",
  sales:
    "Everything happening inside the clients you brought in — whoever is doing it. Watching, not running: the work belongs to whoever the project manager gave it to.",
  mine: "Assigned to you.",
  all: "Everything in flight, in the order work moves through.",
};

// Old links can combine filters; the first match describes the page.
const blurbFor = (params: TasksSearchParams) => {
  if (params.overdue === "true") return BLURBS.overdue;
  if (params.client_owner === "me") return BLURBS.sales;
  if (params.mine === "true") return BLURBS.mine;
  return BLURBS.all;
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
  const role = toUserRole(user?.role);

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

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks">{blurbFor(params)}</PageHeader>
      {role && <ViewTabs label="Task views" tabs={taskViewsFor(role)} />}

      <QueryPrefetch prefetch={prefetch}>
        <TaskBoard canManage={canManage} />
      </QueryPrefetch>
    </div>
  );
};

export default TasksPage;
