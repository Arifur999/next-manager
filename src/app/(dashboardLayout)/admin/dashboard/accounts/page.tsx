import AccountsBoard from "@/components/modules/Admin/Accounts/AccountsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { accountsQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Accounts",
};

const AccountsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(accountsQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts">
        Every wallet the agency holds money in, and what is in each right now.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <AccountsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default AccountsPage;
