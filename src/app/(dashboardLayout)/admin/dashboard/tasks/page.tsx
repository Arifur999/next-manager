import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getTasks } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

const TasksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string; overdue?: string; view?: string }>;
}) => {
  const params = await searchParams;
  const queryClient = new QueryClient();

  // Built the same way the board builds it, so the first paint is the view
  // that was asked for rather than every task followed by a correction.
  const query = [
    params.mine === "true" ? "mine=true" : "",
    params.overdue === "true" ? "overdue=true" : "",
  ]
    .filter(Boolean)
    .join("&");

  await queryClient.prefetchQuery({
    queryKey: ["tasks", query],
    queryFn: () => getTasks(query || undefined),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {params.overdue === "true"
            ? "Overdue tasks"
            : params.mine === "true"
              ? "My tasks"
              : "Tasks"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {params.overdue === "true"
            ? "Past their date and still unfinished. Finishing one takes it off this list."
            : "Everything in flight, in the order work moves through."}
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskBoard />
      </HydrationBoundary>
    </div>
  );
};

export default TasksPage;
