import CompaniesBoard from "@/components/modules/Platform/CompaniesBoard";
import PlansBoard from "@/components/modules/Platform/PlansBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans",
};

// Plans and the companies on them stay together: changing a tier and moving a
// customer onto it are the same job, done minutes apart.
const PlansPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
      <p className="text-sm text-muted-foreground">
        The tiers you sell, and which company is on which. Editing a tier moves every
        company on it at once.
      </p>
    </div>

    <Tabs defaultValue="plans">
      <TabsList>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="assignments">Who is on what</TabsTrigger>
      </TabsList>

      <TabsContent value="plans" className="mt-4">
        <PlansBoard />
      </TabsContent>

      <TabsContent value="assignments" className="mt-4">
        <CompaniesBoard />
      </TabsContent>
    </Tabs>
  </div>
);

export default PlansPage;
