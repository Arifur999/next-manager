import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import SalesOverview from "@/components/modules/Dashboard/SalesOverview";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Sales",
};

// No prefetch: the range is client state and forms part of the query key, so a
// server prefetch would fill a key the screen never asks for.
const SalesDashboardPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Sales">
        Coverage first. Win rate and cycle length are verdicts on work already done —
        by the time they move, the quarter is decided.
      </PageHeader>

      <SalesOverview />

      {/* Win rate and cycle length are verdicts on work already done. They
          belong under what is happening now, not above it. */}
      <KpiScreen scope="sales" />
    </div>
  );
};

export default SalesDashboardPage;
