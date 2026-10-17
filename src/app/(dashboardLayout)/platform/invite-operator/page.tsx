import { site } from "@/data/site"
import PlatformInvites from "@/components/modules/Platform/PlatformInvites";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Invite operator",
};

/**
 * Deliberately NOT called "invite admin".
 *
 * This page adds somebody to the team that runs AGENCIO itself — they see every
 * customer and can suspend any of them. The admin of a customer's agency is a
 * different person entirely, and is created with the company on the customers
 * screen. The old name for this page was read as the second thing, which is the
 * reasonable reading, and it handed out the run of the platform.
 */
const InviteOperatorPage = () => (
  <div className="space-y-6">
    <PageHeader title="Invite an operator">
      Somebody who helps you run {site.name}: they see every customer and can suspend any
      of them. They choose their own password and you approve them; a link alone does
      not create an operator.
    </PageHeader>

    <PlatformInvites />
  </div>
);

export default InviteOperatorPage;
