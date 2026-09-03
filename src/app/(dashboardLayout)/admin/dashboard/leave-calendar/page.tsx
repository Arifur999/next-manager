import LeaveCalendar from "@/components/modules/Admin/Team/LeaveCalendar";
import { getLeaveRequests } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leave calendar",
};

const LeaveCalendarPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["leave-requests"],
    queryFn: () => getLeaveRequests(),
  });

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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LeaveCalendar />
      </HydrationBoundary>
    </div>
  );
};

export default LeaveCalendarPage;
