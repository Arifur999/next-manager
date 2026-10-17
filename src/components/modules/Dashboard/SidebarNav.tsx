"use client";

import type { UserRole } from "@/lib/authUtils";
import { NAV_ICONS } from "@/lib/iconMapper";
import { navGroupId } from "@/lib/navGroups";
import { describeBadge, getNavSections, type NavItem, type NavSection } from "@/lib/navItem";
import { activeNavHref } from "@/lib/navMatch";
import { plural } from "@/lib/text";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { useNavGroups } from "./NavGroupsProvider";
import { useNavBadges, type NavBadgeCounts } from "./useNavBadges";

// 44px rows below md, where this list is tapped in the sheet; 36px above.
const ROW = "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors md:min-h-9";

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

type GroupProps = {
  section: NavSection;
  title: string;
  active: string | null;
  badges: NavBadgeCounts;
  onNavigate?: () => void;
};

// A titled group folds away. Folded, it still shows the sum of its badges, so
// an unread message inside a closed group is not hidden.
const NavGroup = ({ section, title, active, badges, onNavigate }: GroupProps) => {
  const listId = useId();
  const groupId = navGroupId(title);
  const { isOpen, toggle } = useNavGroups();
  const open = isOpen(groupId);
  const foldedCount = section.items.reduce((sum, item) => sum + (item.badge ? badges[item.badge] : 0), 0);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => toggle(groupId)}
        className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-sidebar-foreground md:min-h-8"
      >
        {title}
        <span className="ml-auto flex items-center gap-2">
          {!open && foldedCount > 0 && (
            <>
              <CountPill count={foldedCount} />
              <span className="sr-only">, {plural(foldedCount, "update")}</span>
            </>
          )}
          <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 transition-transform", !open && "-rotate-90")} />
        </span>
      </button>

      <ul id={listId} hidden={!open} className="space-y-0.5">
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
    <nav aria-label="Main" className="flex-1 space-y-3 overflow-y-auto p-4">
      {sections.map((section, index) =>
        section.title ? (
          <NavGroup
            key={section.title}
            section={section}
            title={section.title}
            active={active}
            badges={badges}
            onNavigate={onNavigate}
          />
        ) : (
          <ul key={`section-${index}`} className="space-y-0.5">
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
        ),
      )}
    </nav>
  );
};

export default SidebarNav;
