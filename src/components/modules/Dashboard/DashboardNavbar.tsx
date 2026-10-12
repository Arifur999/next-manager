"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNav from "@/components/modules/Dashboard/MobileNav";
import NotificationBell from "@/components/modules/Dashboard/NotificationBell";
import type { UserRole } from "@/lib/authUtils";
import { logout } from "@/services/logout"
import { type IUser } from "@/types/user.types";
import { LogOut, Monitor, Moon, Sun, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const DashboardNavbar = ({ user, role }: { user: IUser; role: UserRole }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const handleLogout = async () => {
    await logout();
    // The browser cache outlives the session; the next person must not see it.
    queryClient.clear();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav role={role} />
        <p className="text-sm text-muted-foreground">
          <span className="capitalize">{user.role.replace(/_/g, " ")}</span> workspace
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* The platform operator has no company, so nothing is ever addressed
            to them here - they are the one sending. */}
        {user.role !== "super_admin" && <NotificationBell />}

        {/* Light, Dark or follow the system. A two-state toggle could not get
            back to System once someone had pressed it. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Theme">
              {/* CSS picks the icon off the <html class="dark"> that next-themes
                  sets, so there is no browser-only state to hydrate around. */}
              <Sun aria-hidden="true" className="hidden size-4 dark:block" />
              <Moon aria-hidden="true" className="size-4 dark:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun aria-hidden="true" className="size-4" />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon aria-hidden="true" className="size-4" />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor aria-hidden="true" className="size-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2" aria-label={`Account menu for ${user.full_name}`}>
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initialsOf(user.full_name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user.full_name}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/my-profile">
                <User aria-hidden="true" className="size-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardNavbar;
