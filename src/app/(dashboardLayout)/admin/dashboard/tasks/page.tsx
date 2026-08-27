import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getTasks } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

const TasksPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tasks", ""],
    queryFn: () => getTasks(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Everything in flight, in the order work moves through.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskBoard />
      </HydrationBoundary>
    </div>
  );
};

export default TasksPage;
