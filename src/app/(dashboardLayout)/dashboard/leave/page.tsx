import LeaveBoard from "@/components/modules/Admin/People/LeaveBoard";
import { getLeaveRequests, getLeaveTypes } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave",
};

const LeavePage = async () => {
  const queryClient = new QueryClient();

  const [user] = await Promise.all([
    getUserInfo(),
    queryClient.prefetchQuery({
      queryKey: ["leave-requests"],
      queryFn: () => getLeaveRequests(),
    }),
    queryClient.prefetchQuery({ queryKey: ["leave-types"], queryFn: () => getLeaveTypes() }),
  ]);

  // Decided here, from the role this page rendered for, rather than guessed in
  // the component. The API is the one that enforces it — an approver gets 200
  // and everybody else 403 — and showing a button to somebody who cannot use it
  // only teaches them the app is broken. The pair matches the route's
  // `approver`: admin and project_manager, the same two who approve timesheets.
  const canDecide = user?.role === "admin" || user?.role === "project_manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave</h1>
        <p className="text-sm text-muted-foreground">
          Asking to be away, and deciding. Nobody signs off their own — the whole point of
          an approval is that a second person looked at it.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LeaveBoard canDecide={canDecide} />
      </HydrationBoundary>
    </div>
  );
};

export default LeavePage;
