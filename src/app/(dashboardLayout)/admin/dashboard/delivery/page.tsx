import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery",
};

const DeliveryDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Delivery</h1>
        <p className="text-sm text-muted-foreground">
          Is the work landing when it was promised, at the size it was sold.
        </p>
      </div>

      <KpiScreen scope="delivery" />
    </div>
  );
};

export default DeliveryDashboardPage;
