import DepartmentsBoard from "@/components/modules/Admin/Departments/DepartmentsBoard";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { departmentsQuery } from "@/queries/people.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(departmentsQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground">
          Which part of the business somebody is in. Role decides what they may do; this
          decides how the numbers are cut — your designers and developers are all
          operations, and no arrangement of roles tells those two teams apart.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <DepartmentsBoard />
      </QueryPrefetch>
    </div>
  );
};

export default DepartmentsPage;
