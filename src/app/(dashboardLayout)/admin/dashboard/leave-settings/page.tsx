import LeaveTypeBoard from "@/components/modules/Admin/People/LeaveTypeBoard";
import { getLeaveTypes } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave Settings",
};

const LeaveSettingsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["leave-types"],
    queryFn: () => getLeaveTypes(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave Settings</h1>
        <p className="text-sm text-muted-foreground">
          The kinds of leave your agency gives, and how many days each one is worth. Every
          agency starts with four; these are yours to rename, re-price or retire — nobody
          can ask to be away without a kind to ask against.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LeaveTypeBoard />
      </HydrationBoundary>
    </div>
  );
};

export default LeaveSettingsPage;
