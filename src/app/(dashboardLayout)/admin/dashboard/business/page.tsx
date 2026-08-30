import BusinessProfile from "@/components/modules/Admin/Settings/BusinessProfile";
import SubscriptionPanel from "@/components/modules/Admin/Settings/SubscriptionPanel";
import { getOrganization } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Information",
};

const BusinessInformationPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganization(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Information</h1>
        <p className="text-sm text-muted-foreground">
          Who the agency is on paper, and what it is on AGENCIO.
        </p>
      </div>

      {/* Above the details: when a limit refuses something, this is the panel
          the message is pointing at. */}
      <SubscriptionPanel />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <BusinessProfile />
      </HydrationBoundary>
    </div>
  );
};

export default BusinessInformationPage;
