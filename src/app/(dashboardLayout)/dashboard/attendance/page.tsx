import AttendanceBoard from "@/components/modules/Admin/People/AttendanceBoard";
import { getAttendance } from "@/services/agencio.services";
import { getUserInfo } from "@/services/auth.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance",
};

const AttendancePage = async () => {
  const queryClient = new QueryClient();

  const [user] = await Promise.all([
    getUserInfo(),
    queryClient.prefetchQuery({ queryKey: ["attendance"], queryFn: () => getAttendance() }),
  ]);

  // The same two roles the route lets write somebody else's day. Decided here
  // from the role this page rendered for rather than guessed in the component,
  // because the API is what enforces it — everybody else gets a 403, and a form
  // that always fails only teaches people the app is broken.
  const canRecord = user?.role === "admin" || user?.role === "project_manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Who was here, and for how long. Hours booked against a task live on the
          timesheet — being present and doing named work are different facts, and a
          screen that mixes them answers neither question.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AttendanceBoard canRecord={canRecord} />
      </HydrationBoundary>
    </div>
  );
};

export default AttendancePage;
