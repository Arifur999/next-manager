import TransactionsBoard from "@/components/modules/Admin/Transactions/TransactionsBoard";
import { getTransactions } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) => {
  const { kind } = await searchParams;
  const queryClient = new QueryClient();

  // The filter is read here as well as in the board, so the first paint is the
  // view that was asked for rather than every row followed by a correction.
  const query = kind ? `kind=${kind}` : "";

  await queryClient.prefetchQuery({
    queryKey: ["transactions", query],
    queryFn: () => getTransactions(query || undefined),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Every movement of money, written by whatever caused it — a payment, an expense,
          an exchange. Nothing is typed in here, which is why it can be trusted to agree
          with the records it summarises.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <TransactionsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default TransactionsPage;
