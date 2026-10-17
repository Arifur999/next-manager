"use client";

import { activeViewHref } from "@/lib/navMatch";
import type { ViewTab } from "@/lib/pageViews";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Views of one page as links: All / Active / Archived, or Services /
 * Categories / Packages.
 *
 * Links rather than in-page tabs, so every view has a URL that survives a
 * refresh and can be sent to a colleague, and the active one is read off that
 * URL. The row scrolls inside itself, so seven tabs never widen a phone screen.
 */
const ViewTabs = ({ tabs, label }: { tabs: ViewTab[]; label: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = activeViewHref(
    tabs.map((tab) => tab.href),
    pathname,
    searchParams,
  );

  return (
    <nav aria-label={label} className="max-w-full overflow-x-auto">
      <ul className="inline-flex h-11 items-center gap-0.5 rounded-4xl bg-muted p-[3px] text-muted-foreground md:h-9">
        {tabs.map((tab) => {
          const isActive = tab.href === active;

          return (
            <li key={tab.href} className="h-full">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-full items-center rounded-xl px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
                  isActive
                    ? "bg-background text-foreground shadow-sm dark:bg-input/30"
                    : "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ViewTabs;
