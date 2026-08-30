import PermissionsBoard from "@/components/modules/Admin/Permissions/PermissionsBoard";
import { getAllUsers } from "@/services/user.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

const PermissionsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({ queryKey: ["users", ""], queryFn: () => getAllUsers() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Role decides what somebody can reach at all. This narrows it further — it can
          never widen it, so a salesperson given a delivery permission still cannot touch a
          project.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <PermissionsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default PermissionsPage;
