import AgencyInvites from "@/components/modules/Platform/AgencyInvites";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Invite an agency",
};

const InviteAgencyPage = () => (
  <div className="space-y-6">
    <PageHeader title="Invite an agency">
      Hand an agency owner a link. They set their own password and land owning their
      workspace — and from there they add their own sales people, project managers and
      operations team.
    </PageHeader>

    <AgencyInvites />
  </div>
);

export default InviteAgencyPage;
