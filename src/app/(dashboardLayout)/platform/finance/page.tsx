import PlatformFinance from "@/components/modules/Platform/PlatformFinance";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial report",
};

const PlatformFinancePage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Financial report</h1>
      <p className="text-sm text-muted-foreground">
        AGENCIO&apos;s own money — subscription revenue in, what it costs to run out. No
        customer&apos;s books appear here and none can.
      </p>
    </div>

    <PlatformFinance />
  </div>
);

export default PlatformFinancePage;
