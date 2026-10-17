import PlatformFinance from "@/components/modules/Platform/PlatformFinance";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Financial report",
};

const PlatformFinancePage = () => (
  <div className="space-y-6">
    <PageHeader title="Financial report">
      Subscription revenue and what it costs to run the platform. No customer&apos;s books appear here.
    </PageHeader>

    <PlatformFinance />
  </div>
);

export default PlatformFinancePage;
