import WithdrawalsBoard from "@/components/modules/Admin/Withdrawals/WithdrawalsBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Owner Withdrawals",
};

const WithdrawalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Owner withdrawals">
        Money you take out. Admins alone see it — not managers, sales or the team.
      </PageHeader>

      <WithdrawalsBoard />
    </div>
  );
};

export default WithdrawalsPage;
