import NotificationRules from "@/components/modules/Admin/Notifications/NotificationRules";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notificationRulesQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Notifications",
};

const NotificationsPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(notificationRulesQuery());

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications">
        What your team is told about, and who hears it. Everything starts on a sensible
        default — nothing here needed setting up before it worked.
      </PageHeader>

      <QueryPrefetch prefetch={prefetch}>
        <NotificationRules />
      </QueryPrefetch>
    </div>
  );
};

export default NotificationsPage;
