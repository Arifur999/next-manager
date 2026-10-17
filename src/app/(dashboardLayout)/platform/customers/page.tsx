import CustomersBoard from "@/components/modules/Platform/CustomersBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "All users",
};

const CustomersPage = () => (
  <div className="space-y-6">
    <PageHeader title="All users">
      Every company on the platform, including trials, and the person each one was sold
      to.
    </PageHeader>

    <CustomersBoard />
  </div>
);

export default CustomersPage;
