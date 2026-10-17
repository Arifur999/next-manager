import LeadPipeline from "@/components/modules/Admin/Leads/LeadPipeline";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { leadPipelineQuery } from "@/queries/crm.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";
import { getUserInfo } from "@/services/auth.services";

export const metadata: Metadata = {
  title: "Leads",
};

const LeadsPage = async () => {
  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(leadPipelineQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Leads">
        Deals not won yet. Converting one creates the client and marks the lead in the same
        step, so the two can never disagree.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <LeadPipeline isAdmin={user?.role === "admin"} />
      </QueryPrefetch>
    </div>
  );
};

export default LeadsPage;
