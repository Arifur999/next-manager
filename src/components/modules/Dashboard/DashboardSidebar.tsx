"use client";

import { getIcon } from "@/lib/iconMapper";
import { getNavSections } from "@/lib/navItem";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/authUtils";
import { getAllUsers } from "@/services/user.services";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Which entry is the one you are on.
 *
 * Two things make this harder than comparing strings.
 *
 * Several entries point at the same page with a different filter — All
 * Clients, Active, Inactive, Archived are one board and four links — so an
 * entry WITH a query matches only when every parameter in it does, and an
 * entry WITHOUT one is the unfiltered view and does not match while a
 * sibling's filter is set.
 *
 * And one entry's path can be a prefix of another's: /reports is the Business
 * report, /reports/clients is a different page. Matching by prefix alone
 * lights both. So every candidate is collected and the LONGEST matching path
 * wins — which still keeps All Clients lit on a client's detail page, because
 * nothing deeper is in the sidebar to beat it.
 */
const matches = (href: string, pathname: string, params: URLSearchParams) => {
  const [path, queryString] = href.split("?");

  if (path === "/") return pathname === "/";
  if (!pathname.startsWith(path)) return false;

  if (!queryString) return params.size === 0;

  const wanted = new URLSearchParams(queryString);
  for (const [key, value] of wanted) {
    if (params.get(key) !== value) return false;
  }

  return true;
};

/** The href of the entry that wins, or null when none of them do. */
const currentHref = (
  hrefs: string[],
  pathname: string,
  params: URLSearchParams
): string | null =>
  hrefs
    .filter((href) => matches(href, pathname, params))
    .sort((a, b) => b.split("?")[0].length - a.split("?")[0].length)[0] ?? null;
const DashboardSidebar = ({ role }: { role: UserRole }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sections = getNavSections(role);

  // Decided once across every entry, not per entry: the winner depends on
  // what the others matched.
  const active = currentHref(
    sections.flatMap((section) => section.items.map((item) => item.href)),
    pathname,
    searchParams
  );

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
              const isActive = item.href === active;

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
