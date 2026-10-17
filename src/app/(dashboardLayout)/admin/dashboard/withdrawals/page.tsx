import WithdrawalsBoard from "@/components/modules/Admin/Withdrawals/WithdrawalsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { ownerWithdrawalsListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Owner withdrawals",
};

const WithdrawalsPage = async () => {
  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(ownerWithdrawalsListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Owner withdrawals">
        Money you take out. Admins alone see it — not managers, sales or the team.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <WithdrawalsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default WithdrawalsPage;
