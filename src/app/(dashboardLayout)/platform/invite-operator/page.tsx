import PlatformInvites from "@/components/modules/Platform/PlatformInvites";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { platformInvitesQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Invite an operator",
};

const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(platformInvitesQuery());

// Not "invite admin": an operator runs the platform and can suspend any customer,
// which is a different person from the admin of a customer's agency.
const InviteOperatorPage = () => (
  <div className="space-y-6">
    <PageHeader title="Invite an operator">
      Add someone to the team that runs the platform; agency owners come in through{" "}
      <Link href="/platform/invite-agency" className="text-primary underline-offset-4 hover:underline">
        Invite an agency
      </Link>
      .
    </PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <PlatformInvites />
    </QueryPrefetch>
  </div>
);

export default InviteOperatorPage;
