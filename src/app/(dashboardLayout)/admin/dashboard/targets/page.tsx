import TargetsBoard from "@/components/modules/Admin/Targets/TargetsBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Targets",
};

const TargetsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Targets</h1>
        <p className="text-sm text-muted-foreground">
          62% utilization is neither good nor bad until somebody writes down what it was
          supposed to be. Until then every dashboard shows facts, not verdicts.
        </p>
      </div>

      <TargetsBoard />
    </div>
  );
};

export default TargetsPage;
