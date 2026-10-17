"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { UserRole } from "@/lib/authUtils";
import { Menu } from "lucide-react";
import { useState } from "react";
import SidebarNav from "./SidebarNav";

// Below lg the sidebar is hidden; the same nav opens in a sheet instead.
const MobileNav = ({ role }: { role: UserRole }) => {
  const [open, setOpen] = useState(false);

  // Open on the page you are on: focus lands on its entry and the list scrolls
  // to it, instead of the top of a long list and the sheet's close button.
  const focusCurrentEntry = (event: Event) => {
    const content = event.currentTarget;
    if (!(content instanceof HTMLElement)) return;
    const current = content.querySelector<HTMLElement>('nav [aria-current="page"]');
    // Inside a group somebody folded, the entry cannot take focus; the sheet's default stands.
    if (!current || current.closest("[hidden]")) return;
    event.preventDefault();
    current.focus({ preventScroll: true });
    current.scrollIntoView({ block: "center" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        aria-describedby={undefined}
        onOpenAutoFocus={focusCurrentEntry}
        className="w-72 gap-0 bg-sidebar p-0"
      >
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <SheetTitle className="text-lg font-semibold tracking-tight">Naxified</SheetTitle>
        </div>
        <SidebarNav role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
