import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import { getUserInfo } from "@/services/auth.services";
import { toUserRole } from "@/types/user.types";
import { redirect } from "next/navigation";
import React from "react";

// Reads cookies for the signed-in user, so it must not be statically cached -
// a cached shell would show one user's name to the next visitor.
export const dynamic = "force-dynamic";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUserInfo();

  // The proxy already blocks anonymous access; this is the second line of
  // defence for the case where the token is valid but the account is gone.
  if (!user) {
    redirect("/login");
  }

  const role = toUserRole(user.role);

  if (!role) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar role={role} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar user={user} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
