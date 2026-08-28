import TimesheetBoard from "@/components/modules/Admin/Time/TimesheetBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timesheet",
};

// Not prefetched: the board picks its own week on the client and the range is
// part of the query key, so a server prefetch would populate a key the board
// never asks for.
const TimesheetPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timesheet</h1>
        <p className="text-sm text-muted-foreground">
          Your week. Log the non-billable hours too — utilization is only honest when the
          denominator is real.
        </p>
      </div>

      <TimesheetBoard />
    </div>
  );
};

export default TimesheetPage;
