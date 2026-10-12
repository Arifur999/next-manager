import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import QueryProviders from "@/app/providers/QueryProvider";
import { getUserInfo } from "@/services/auth.services";
import { toUserRole } from "@/types/user.types";
import { redirect } from "next/navigation";
import React from "react";

// Reads cookies for the signed-in user, so it must not be statically cached -
// a cached shell would show one user's name to the next visitor.
export const dynamic = "force-dynamic";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUserInfo();

  // The proxy already blocks anonymous access; this catches a token that still
  // verifies but that the API refuses (password changed, account deactivated).
  // The reason tells the proxy to clear the cookies instead of bouncing back.
  if (!user) {
    redirect("/login?reason=session-expired");
  }

  const role = toUserRole(user.role);

  if (!role) {
    redirect("/login?reason=session-expired");
  }

  // TanStack Query lives here and in the auth layout, not in the root layout,
  // so the marketing page does not ship or run it. Both use the same browser
  // QueryClient (getQueryClient), so the cache survives sign-in.
  return (
    <QueryProviders>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar role={role} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardNavbar user={user} role={role} />

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6"
          >
            {children}
          </main>
        </div>
      </div>
    </QueryProviders>
  );
};

export default DashboardLayout;
