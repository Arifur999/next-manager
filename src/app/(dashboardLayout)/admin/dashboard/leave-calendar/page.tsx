import LeaveCalendar from "@/components/modules/Admin/Team/LeaveCalendar";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leaveRequestsListQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Leave calendar",
};

const LeaveCalendarPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(leaveRequestsListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Leave calendar">
        Who is away, and when. Approved leave only — a request still waiting is not an
        absence yet, and planning around one that gets turned down gives work away for
        nothing.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <LeaveCalendar />
      </QueryPrefetch>
    </div>
  );
};

export default LeaveCalendarPage;
