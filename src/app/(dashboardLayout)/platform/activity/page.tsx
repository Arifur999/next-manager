import PlatformActivityFeed from "@/components/modules/Platform/PlatformActivityFeed";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Admin activity",
};

const AdminActivityPage = () => (
  <div className="space-y-6">
    <PageHeader title="Admin activity">
      Every action the platform team has taken against a customer, in the words
      recorded at the time.
    </PageHeader>

    <PlatformActivityFeed />
  </div>
);

export default AdminActivityPage;
