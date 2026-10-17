import WithdrawalsBoard from "@/components/modules/Admin/Withdrawals/WithdrawalsBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Owner Withdrawals",
};

// Deliberately not prefetched. The endpoint is owner-only, and a prefetch from
// a non-owner session would throw during render rather than letting the board
// show its "owner only" state.
const WithdrawalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Owner withdrawals">
        Money you take out. Visible to the owner alone — not to admins or managers.
      </PageHeader>

      <WithdrawalsBoard />
    </div>
  );
};

export default WithdrawalsPage;
