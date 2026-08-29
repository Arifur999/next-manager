import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales",
};

// No prefetch: the range is client state and forms part of the query key, so a
// server prefetch would fill a key the screen never asks for.
const SalesDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
        <p className="text-sm text-muted-foreground">
          Coverage first. Win rate and cycle length are verdicts on work already done —
          by the time they move, the quarter is decided.
        </p>
      </div>

      <KpiScreen scope="sales" />
    </div>
  );
};

export default SalesDashboardPage;
