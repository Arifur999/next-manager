import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active users",
};

// The same board with a different default filter. Two screens would have been
// two places to fix the same bug.
const ActiveUsersPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Active users</h1>
      <p className="text-sm text-muted-foreground">
        Companies on a paid plan. Trials are on the All users screen — they are worth
        nothing yet, by definition.
      </p>
    </div>

    <CustomersBoard defaultFilter="active" />
  </div>
);

export default ActiveUsersPage;
