import SubscriptionPanel from "@/components/modules/Admin/Settings/SubscriptionPanel";
import SettingsBoard from "@/components/modules/Admin/Settings/SettingsBoard";
import {
  getExpenseCategories,
  getOrganization,
  getRateSettings,
} from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["organization"], queryFn: () => getOrganization() }),
    queryClient.prefetchQuery({ queryKey: ["rate-settings"], queryFn: () => getRateSettings() }),
    queryClient.prefetchQuery({
      queryKey: ["expense-categories"],
      queryFn: () => getExpenseCategories(),
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          How the agency reports money, what it spends on, and who it is on paper.
        </p>
      </div>

      {/* Above the rest: when a limit refuses something, this is the panel
          the message is pointing at. */}
      <SubscriptionPanel />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SettingsBoard />
      </HydrationBoundary>
    </div>
  );
};

export default SettingsPage;
