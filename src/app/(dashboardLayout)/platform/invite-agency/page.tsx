import AgencyInvites from "@/components/modules/Platform/AgencyInvites";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { agencyInvitesQuery, plansQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite an agency",
};

const prefetch = (queryClient: QueryClient) =>
  Promise.all([queryClient.prefetchQuery(agencyInvitesQuery()), queryClient.prefetchQuery(plansQuery())]);

const InviteAgencyPage = () => (
  <div className="space-y-6">
    <PageHeader title="Invite an agency">
      Send an agency owner a link to set up and own their workspace.
    </PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <AgencyInvites />
    </QueryPrefetch>
  </div>
);

export default InviteAgencyPage;
