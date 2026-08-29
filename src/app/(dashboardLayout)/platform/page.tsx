import CompaniesBoard from "@/components/modules/Platform/CompaniesBoard";
import PlansBoard from "@/components/modules/Platform/PlansBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform",
};

/**
 * Where a super admin lands.
 *
 * Companies first, plans second: provisioning and suspending is the daily job,
 * editing tiers is occasional.
 */
const PlatformPage = async () => {
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.full_name ?? "super admin"}. This account belongs to no company
          and cannot read any company&apos;s money — only how big it is and what it pays.
        </p>
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-4">
          <CompaniesBoard />
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <PlansBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformPage;
