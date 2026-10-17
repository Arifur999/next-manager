import TargetsBoard from "@/components/modules/Admin/Targets/TargetsBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Targets",
};

const TargetsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Targets">
        62% utilization is neither good nor bad until somebody writes down what it was
        supposed to be. Until then every dashboard shows facts, not verdicts.
      </PageHeader>

      <TargetsBoard />
    </div>
  );
};

export default TargetsPage;
