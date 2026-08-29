import PlatformCharts from "@/components/modules/Platform/PlatformCharts";
import PlatformOverview from "@/components/modules/Platform/PlatformOverview";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform",
};

/**
 * Where a super admin lands.
 *
 * Was a page of tabs; each area is now its own route, so the sidebar can name
 * them and a link to one can be sent to somebody. This keeps only what belongs
 * on a dashboard: how the business is doing, and what needs doing today.
 */
const PlatformPage = async () => {
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.full_name ?? "super admin"}. This account belongs to no
          company and cannot read any company&apos;s money — only how big it is and what it
          pays.
        </p>
      </div>

      <PlatformOverview />
      <PlatformCharts />
    </div>
  );
};

export default PlatformPage;
