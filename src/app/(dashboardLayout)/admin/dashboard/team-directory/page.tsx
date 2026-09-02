import TeamDirectory from "@/components/modules/Admin/Team/TeamDirectory";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Directory",
};

const TeamDirectoryPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Who works here and how to reach them. Adding, editing and deactivating people
          happens under Users, which is the admin&apos;s screen — this one only reads.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamDirectory />
      </HydrationBoundary>
    </div>
  );
};

export default TeamDirectoryPage;
