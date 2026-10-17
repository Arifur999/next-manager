import ExpensesTable from "@/components/modules/Admin/Expenses/ExpensesTable";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { expensesListQuery } from "@/queries/spending.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Expenses",
};

const ExpensesPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(expensesListQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses">
        What the agency spends, in BDT. Employee costs are tracked apart from operating costs.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <ExpensesTable />
      </QueryPrefetch>
    </div>
  );
};

export default ExpensesPage;
