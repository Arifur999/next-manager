import LeaveTypeBoard from "@/components/modules/Admin/People/LeaveTypeBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leaveTypesQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Leave Settings",
};

const LeaveSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(leaveTypesQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave Settings</h1>
        <p className="text-sm text-muted-foreground">
          The kinds of leave your agency gives, and how many days each one is worth. Every
          agency starts with four; these are yours to rename, re-price or retire — nobody
          can ask to be away without a kind to ask against.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <LeaveTypeBoard />
      </QueryPrefetch>
    </div>
  );
};

export default LeaveSettingsPage;
