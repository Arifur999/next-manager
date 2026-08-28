import ApprovalQueue from "@/components/modules/Admin/Time/ApprovalQueue";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Time approvals",
};

const TimeApprovalsPage = async () => {
  const user = await getUserInfo();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Time approvals</h1>
        <p className="text-sm text-muted-foreground">
          Approval is what makes an hour billable, so it takes a second person. Approved
          entries are frozen — reopen one to let it be corrected.
        </p>
      </div>

      {/* The viewer's id is passed so their own rows can be shown but not
          self-approved, which is what the server enforces anyway. */}
      <ApprovalQueue viewerId={user.id} />
    </div>
  );
};

export default TimeApprovalsPage;
