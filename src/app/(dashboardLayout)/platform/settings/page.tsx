import PlatformSettings from "@/components/modules/Platform/PlatformSettings";
import PageHeader from "@/components/shared/PageHeader";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import { platformSettingsQuery } from "@/queries/platform.queries";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(platformSettingsQuery());

const SettingsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Settings">
      The name on outgoing mail, the support address, and what new sign-ups are put on.
    </PageHeader>

    <QueryPrefetch prefetch={prefetch}>
      <PlatformSettings />
    </QueryPrefetch>
  </div>
);

export default SettingsPage;
