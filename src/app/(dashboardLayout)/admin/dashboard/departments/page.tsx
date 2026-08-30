import DepartmentsBoard from "@/components/modules/Admin/Departments/DepartmentsBoard";
import { getDepartments } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departments",
};

const DepartmentsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

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

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DepartmentsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default DepartmentsPage;
