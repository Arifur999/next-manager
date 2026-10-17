import KpiScreen from "@/components/modules/Dashboard/KpiScreen";
import PmOverview from "@/components/modules/Dashboard/PmOverview";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Delivery",
};

const DeliveryDashboardPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Delivery">
        Is the work landing when it was promised, at the size it was sold.
      </PageHeader>

      <PmOverview />

      <KpiScreen scope="delivery" />
    </div>
  );
};

export default DeliveryDashboardPage;
