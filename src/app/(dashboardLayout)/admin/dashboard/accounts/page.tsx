import AccountsBoard from "@/components/modules/Admin/Accounts/AccountsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { accountsQuery } from "@/queries/finance.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Accounts",
};

const AccountsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(accountsQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every wallet the agency holds money in, and what is in each right now.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <AccountsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default AccountsPage;
