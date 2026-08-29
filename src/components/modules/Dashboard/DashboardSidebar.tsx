"use client";

import { getIcon } from "@/lib/iconMapper";
import { getNavSections } from "@/lib/navItem";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/authUtils";
import { getAllUsers } from "@/services/user.services";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardSidebar = ({ role }: { role: UserRole }) => {
  const pathname = usePathname();
  const sections = getNavSections(role);

  // Only admin can approve, so only admin is asked. Somebody waiting to join
  // is invisible until an admin happens to open the team screen, and a person
  // who cannot sign in is not going to chase it themselves.
  const { data: pendingData } = useQuery({
    queryKey: ["users", "status=pending"],
    queryFn: () => getAllUsers("status=pending"),
    enabled: role === "admin",
    // Cheap and rarely changing. A minute is soon enough for somebody who is
    // waiting on a human anyway.
    staleTime: 60_000,
  });

  const pendingCount = pendingData?.data?.length ?? 0;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Naxified
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {sections.map((section, index) => (
          <div key={section.title ?? `section-${index}`} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const Icon = getIcon(item.icon);
              // startsWith, so a nested route keeps its parent highlighted -
              // but "/" would then match everything.
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.title}
                  {item.href === "/admin/dashboard/team-management" && pendingCount > 0 && (
                    <span
                      className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground tabular-nums"
                      aria-label={`${pendingCount} waiting to join`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
