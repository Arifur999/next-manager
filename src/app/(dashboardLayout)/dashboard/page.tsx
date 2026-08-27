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
          Welcome back, {user?.full_name ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">Your workspace at a glance.</p>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
