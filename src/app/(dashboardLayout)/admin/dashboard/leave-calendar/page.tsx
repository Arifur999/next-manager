import LeaveCalendar from "@/components/modules/Admin/Team/LeaveCalendar";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leaveRequestsListQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Leave calendar",
};

const LeaveCalendarPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(leaveRequestsListQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave calendar</h1>
        <p className="text-sm text-muted-foreground">
          Who is away, and when. Approved leave only — a request still waiting is not an
          absence yet, and planning around one that gets turned down gives work away for
          nothing.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <LeaveCalendar />
      </QueryPrefetch>
    </div>
  );
};

export default LeaveCalendarPage;
