import TimesheetBoard from "@/components/modules/Admin/Time/TimesheetBoard";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Timesheet",
};

// Not prefetched: the board picks its own week on the client and the range is
// part of the query key, so a server prefetch would populate a key the board
// never asks for.
const TimesheetPage = async () => {
  const user = await getUserInfo();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timesheet</h1>
        <p className="text-sm text-muted-foreground">
          Your week. Log the non-billable hours too — utilization is only honest when the
          denominator is real.
        </p>
      </div>

      {/*
        Scoped to the viewer explicitly. The API only narrows to "own rows" for
        operations; an admin asking for entries gets the whole company's, which
        on a page titled "your week" would total the team's hours and read as
        the viewer's own.
      */}
      <TimesheetBoard userId={user.id} />
    </div>
  );
};

export default TimesheetPage;
