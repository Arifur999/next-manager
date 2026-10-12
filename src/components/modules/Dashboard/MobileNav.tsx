"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { UserRole } from "@/lib/authUtils";
import { Menu } from "lucide-react";
import { useState } from "react";
import SidebarNav from "./SidebarNav";

// Below md the sidebar is hidden; the same nav opens in a sheet instead.
const MobileNav = ({ role }: { role: UserRole }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby={undefined} className="w-72 gap-0 bg-sidebar p-0">
        <div className="flex h-16 items-center border-b px-6">
          <SheetTitle className="text-lg font-semibold tracking-tight">Naxified</SheetTitle>
        </div>
        <SidebarNav role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
