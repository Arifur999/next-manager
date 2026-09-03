import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getTasks, getWorkflowStatuses } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

const TasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    mine?: string;
    overdue?: string;
    view?: string;
    client_owner?: string;
  }>;
}) => {
  const params = await searchParams;
  const queryClient = new QueryClient();

  // Built the same way the board builds it, so the first paint is the view
  // that was asked for rather than every task followed by a correction.
  const query = [
    params.mine === "true" ? "mine=true" : "",
    params.overdue === "true" ? "overdue=true" : "",
    params.client_owner === "me" ? "client_owner=me" : "",
  ]
    .filter(Boolean)
    .join("&");

  const [user] = await Promise.all([
    getUserInfo(),
    queryClient.prefetchQuery({
      queryKey: ["tasks", query],
      queryFn: () => getTasks(query || undefined),
      staleTime: 1000 * 30,
    }),
    // The board draws its COLUMNS from these, so without them the server
    // renders a board with no columns and therefore no tasks — everything
    // appearing only once the browser has hydrated and fetched them. The list
    // and calendar views never showed it because they read tasks directly.
    queryClient.prefetchQuery({
      queryKey: ["workflow-statuses", "task"],
      queryFn: () => getWorkflowStatuses("kind=task"),
      staleTime: 1000 * 30,
    }),
  ]);

  // The two roles that own the schedule. Sales reads this board; the API
  // refuses them every write behind it, so the create button would only be a
  // button that fails.
  const canManage = user?.role === "admin" || user?.role === "project_manager";

  const salesView = params.client_owner === "me";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {params.overdue === "true"
            ? "Overdue tasks"
            : salesView
              ? "Sales tasks"
              : params.mine === "true"
                ? "My tasks"
                : "Tasks"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {params.overdue === "true"
            ? "Past their date and still unfinished. Finishing one takes it off this list."
            : salesView
              ? "Everything happening inside the clients you brought in — whoever is doing it. Watching, not running: the work belongs to whoever the project manager gave it to."
              : params.mine === "true"
                ? "Assigned to you."
                : "Everything in flight, in the order work moves through."}
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskBoard canManage={canManage} />
      </HydrationBoundary>
    </div>
  );
};

export default TasksPage;
