import type { UserRole } from "@/lib/authUtils";
import Link from "next/link";
import SidebarNav from "./SidebarNav";

const DashboardSidebar = ({ role }: { role: UserRole }) => (
  <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
    <div className="flex h-16 items-center border-b px-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Naxified
      </Link>
    </div>
    <SidebarNav role={role} />
  </aside>
);

export default DashboardSidebar;
