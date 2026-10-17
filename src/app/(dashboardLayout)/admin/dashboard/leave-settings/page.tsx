import LeaveTypeBoard from "@/components/modules/Admin/People/LeaveTypeBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leaveTypesQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Leave Settings",
};

const LeaveSettingsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(leaveTypesQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Settings">
        The kinds of leave your agency gives, and how many days each one is worth. Every
        agency starts with four; these are yours to rename, re-price or retire — nobody
        can ask to be away without a kind to ask against.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <LeaveTypeBoard />
      </QueryPrefetch>
    </div>
  );
};

export default LeaveSettingsPage;
