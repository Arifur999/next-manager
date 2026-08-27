import TaskBoard from "@/components/modules/Admin/Tasks/TaskBoard";
import { getTasks } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
};

// The same board, scoped to the signed-in person. The server narrows a member
// to their own tasks anyway; ?mine=true makes it explicit for everyone else.
const MyTasksPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tasks", "mine=true"],
    queryFn: () => getTasks("mine=true"),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My tasks</h1>
        <p className="text-sm text-muted-foreground">Work assigned to you.</p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskBoard mineOnly />
      </HydrationBoundary>
    </div>
  );
};

export default MyTasksPage;
