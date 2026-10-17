import AttendanceBoard from "@/components/modules/Admin/People/AttendanceBoard";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { attendanceQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Attendance",
};

const AttendancePage = async () => {
  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(attendanceQuery()),
  ]);

  // The same two roles the route lets write somebody else's day. Decided here
  // from the role this page rendered for rather than guessed in the component,
  // because the API is what enforces it — everybody else gets a 403, and a form
  // that always fails only teaches people the app is broken.
  const canRecord = user?.role === "admin" || user?.role === "project_manager";

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance">
        Who was here, and for how long. Hours booked against a task live on the
        timesheet — being present and doing named work are different facts, and a
        screen that mixes them answers neither question.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <AttendanceBoard canRecord={canRecord} />
      </QueryPrefetch>
    </div>
  );
};

export default AttendancePage;
