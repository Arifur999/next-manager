import { getDefaultDashboardRoute, type UserRole } from "@/lib/authUtils";
import Link from "next/link";
import SidebarNav from "./SidebarNav";

// From lg only: at 768 a fixed 16rem sidebar left 512px for the page, so
// tablets get the sheet (MobileNav) like phones do. The logo goes to the
// role's own home, not the marketing page.
const DashboardSidebar = ({ role }: { role: UserRole }) => (
  <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
    <div className="flex h-16 shrink-0 items-center border-b px-6">
      <Link href={getDefaultDashboardRoute(role)} className="text-lg font-semibold tracking-tight">
        Naxified
      </Link>
    </div>
    <SidebarNav role={role} />
  </aside>
);

export default DashboardSidebar;
