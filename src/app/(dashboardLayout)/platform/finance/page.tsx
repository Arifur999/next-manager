import { site } from "@/data/site"
import PlatformFinance from "@/components/modules/Platform/PlatformFinance";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Financial report",
};

const PlatformFinancePage = () => (
  <div className="space-y-6">
    <PageHeader title="Financial report">
      {site.name}&apos;s own money: subscription revenue in, what it costs to run out. No
      customer&apos;s books appear here and none can.
    </PageHeader>

    <PlatformFinance />
  </div>
);

export default PlatformFinancePage;
