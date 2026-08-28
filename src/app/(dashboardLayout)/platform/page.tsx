import { Card } from "@/components/ui/card";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Platform",
};

/**
 * Where a super admin lands.
 *
 * A placeholder on purpose, not an oversight: the platform console — create a
 * company, assign a plan, start a trial, suspend — is Phase 6, and it needs the
 * Plan and Subscription models that do not exist yet. What it must NOT do is
 * 404, because the proxy sends every super_admin here on sign-in.
 *
 * It says what it is rather than pretending to be finished.
 */
const PlatformPage = async () => {
  const user = await getUserInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.full_name ?? "super admin"}. This account belongs to no company and
          cannot read any company&apos;s money.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <ShieldCheck className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">The platform console is not built yet.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Creating a company, assigning a plan, starting a trial and suspending all need the Plan
          and Subscription models, which arrive with billing. Until then companies are created by
          signing up, and whoever signs up becomes that company&apos;s first admin.
        </p>
      </Card>
    </div>
  );
};

export default PlatformPage;
