import DepartmentsBoard from "@/components/modules/Admin/Departments/DepartmentsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { departmentsQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(departmentsQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Departments">
        Which part of the business somebody is in. Role decides what they may do; this
        decides how the numbers are cut — your designers and developers are all
        operations, and no arrangement of roles tells those two teams apart.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <DepartmentsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default DepartmentsPage;
