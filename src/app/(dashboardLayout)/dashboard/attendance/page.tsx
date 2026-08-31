import AttendanceBoard from "@/components/modules/Admin/People/AttendanceBoard";
import { getAttendance } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance",
};

const AttendancePage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["attendance"],
    queryFn: () => getAttendance(),
  });

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
        <AttendanceBoard />
      </HydrationBoundary>
    </div>
  );
};

export default AttendancePage;
