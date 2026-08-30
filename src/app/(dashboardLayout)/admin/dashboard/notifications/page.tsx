import NotificationRules from "@/components/modules/Admin/Notifications/NotificationRules";
import { getNotificationRules } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

const NotificationsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notification-rules"],
    queryFn: () => getNotificationRules(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          What your team is told about, and who hears it. Everything starts on a sensible
          default — nothing here needed setting up before it worked.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotificationRules />
      </HydrationBoundary>
    </div>
  );
};

export default NotificationsPage;
