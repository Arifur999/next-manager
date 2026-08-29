import AgencyInvites from "@/components/modules/Platform/AgencyInvites";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite an agency",
};

const InviteAgencyPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Invite an agency</h1>
      <p className="text-sm text-muted-foreground">
        Hand an agency owner a link. They set their own password and land owning their
        workspace — and from there they add their own sales people, project managers and
        operations team.
      </p>
    </div>

    <AgencyInvites />
  </div>
);

export default InviteAgencyPage;
