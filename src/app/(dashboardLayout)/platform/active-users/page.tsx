import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Active users",
};

// The same board with a different default filter. Two screens would have been
// two places to fix the same bug.
const ActiveUsersPage = () => (
  <div className="space-y-6">
    <PageHeader title="Active users">
      Companies on a paid plan. Trials are on the All users screen — they are worth
      nothing yet, by definition.
    </PageHeader>

    <CustomersBoard defaultFilter="active" />
  </div>
);

export default ActiveUsersPage;
