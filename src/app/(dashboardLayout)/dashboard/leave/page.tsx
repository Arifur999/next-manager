import LeaveBoard from "@/components/modules/Admin/People/LeaveBoard";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leaveRequestsListQuery, leaveTypesQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Leave",
};

const LeavePage = async () => {
  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(leaveRequestsListQuery()),
    queryClient.prefetchQuery(leaveTypesQuery()),
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

      <QueryPrefetch prefetch={prefetch}>
        <LeaveBoard canDecide={canDecide} />
      </QueryPrefetch>
    </div>
  );
};

export default LeavePage;
