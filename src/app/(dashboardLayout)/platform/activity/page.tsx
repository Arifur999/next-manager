import PlatformActivityFeed from "@/components/modules/Platform/PlatformActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin activity",
};

const AdminActivityPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Admin activity</h1>
      <p className="text-sm text-muted-foreground">
        Every action the platform team has taken against a customer, in the words
        recorded at the time.
      </p>
    </div>

    <PlatformActivityFeed />
  </div>
);

export default AdminActivityPage;
