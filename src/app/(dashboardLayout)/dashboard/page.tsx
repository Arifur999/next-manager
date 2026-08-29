import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const StaffDashboardPage = async () => {
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your hours, your deadlines, and what is still waiting on you.
        </p>
      </div>

      <KpiScreen scope="me" />
    </div>
  );
};

export default StaffDashboardPage;
