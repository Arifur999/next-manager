import WithdrawalsBoard from "@/components/modules/Admin/Withdrawals/WithdrawalsBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Withdrawals",
};

// Deliberately not prefetched. The endpoint is owner-only, and a prefetch from
// a non-owner session would throw during render rather than letting the board
// show its "owner only" state.
const WithdrawalsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Owner withdrawals</h1>
        <p className="text-sm text-muted-foreground">
          Money you take out. Visible to the owner alone — not to admins or managers.
        </p>
      </div>

      <WithdrawalsBoard />
    </div>
  );
};

export default WithdrawalsPage;
