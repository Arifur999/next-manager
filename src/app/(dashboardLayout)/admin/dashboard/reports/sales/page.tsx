import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales report",
};

// No prefetch: the range is client state and forms part of the query key, so a
// server prefetch would fill a key the screen never asks for.
const SalesReportPage = async () => {
  const user = await getUserInfo();
  const mine = user?.role === "sales";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mine ? "Your sales" : "Sales"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mine
            ? "Your deals only — what you have open, what you won, and how long it took. The server scopes this to the leads you own, so it is yours rather than the agency's with your name on it."
            : "Coverage first. Win rate and cycle length are verdicts on work already done — by the time they move, the quarter is decided."}
        </p>
      </div>

      <KpiScreen scope="sales" />
    </div>
  );
};

export default SalesReportPage;
