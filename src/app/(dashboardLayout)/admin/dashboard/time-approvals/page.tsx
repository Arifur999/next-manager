import ApprovalQueue from "@/components/modules/Admin/Time/ApprovalQueue";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Time approvals",
};

const TimeApprovalsPage = async () => {
  const user = await getUserInfo();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader title="Time approvals">
        Approval is what makes an hour billable, so it takes a second person. Approved
        entries are frozen — reopen one to let it be corrected.
      </PageHeader>

      {/* The viewer's id is passed so their own rows can be shown but not
          self-approved, which is what the server enforces anyway. */}
      <ApprovalQueue viewerId={user.id} />
    </div>
  );
};

export default TimeApprovalsPage;
