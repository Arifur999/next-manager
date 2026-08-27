import AccountsBoard from "@/components/modules/Admin/Accounts/AccountsBoard";
import { getAccounts } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts",
};

const AccountsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    staleTime: 1000 * 30,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Every wallet the agency holds money in, and what is in each right now.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default AccountsPage;
