import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All users",
};

const CustomersPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">All users</h1>
      <p className="text-sm text-muted-foreground">
        Every company on the platform, including trials, and the person each one was sold
        to.
      </p>
    </div>

    <CustomersBoard />
  </div>
);

export default CustomersPage;
