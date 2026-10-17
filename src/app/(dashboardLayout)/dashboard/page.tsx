import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import OpsOverview from "@/components/modules/Dashboard/OpsOverview";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Dashboard",
};

const StaffDashboardPage = async () => {
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <PageHeader title={<>Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}</>}>
        Your hours, your deadlines, and what is still waiting on you.
      </PageHeader>

      <OpsOverview />

      <KpiScreen scope="me" />
    </div>
  );
};

export default StaffDashboardPage;
