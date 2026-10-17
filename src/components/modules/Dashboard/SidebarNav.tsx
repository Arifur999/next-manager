"use client";

import type { UserRole } from "@/lib/authUtils";
import { NAV_ICONS } from "@/lib/iconMapper";
import { describeBadge, getNavSections, type NavItem } from "@/lib/navItem";
import { activeNavHref } from "@/lib/navMatch";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavBadges, type NavBadgeCounts } from "./useNavBadges";

const ROW = "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors";

const CountPill = ({ count }: { count: number }) => (
  <span
    aria-hidden="true"
    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground tabular-nums"
  >
    {count > 99 ? "99+" : count}
  </span>
);

type EntryProps = {
  item: NavItem;
  isActive: boolean;
  badges: NavBadgeCounts;
  onNavigate?: () => void;
};

const NavEntry = ({ item, isActive, badges, onNavigate }: EntryProps) => {
  const Icon = NAV_ICONS[item.icon];
  const count = item.badge ? badges[item.badge] : 0;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          ROW,
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {item.title}
        {item.badge && count > 0 && (
          <>
            <CountPill count={count} />
            <span className="sr-only">, {describeBadge(item.badge, count)}</span>
          </>
        )}
      </Link>
    </li>
  );
};

// The nav list itself, shared by the desktop sidebar and the mobile sheet.
// onNavigate lets the sheet close when a link is followed.
const SidebarNav = ({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) => {
  const pathname = usePathname();
  const badges = useNavBadges(role);
  const sections = getNavSections(role);

  // Decided once across every entry, not per entry: the winner depends on
  // what the others matched.
  const active = activeNavHref(
    sections.flatMap((section) => section.items),
    pathname,
  );

  return (
    <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto p-4">
      {sections.map((section, index) => (
        <div key={section.title ?? `section-${index}`} className="space-y-1">
          {section.title && (
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {section.title}
            </p>
          )}

          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <NavEntry
                key={item.href}
                item={item}
                isActive={item.href === active}
                badges={badges}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default SidebarNav;
