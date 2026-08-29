import PlatformInvites from "@/components/modules/Platform/PlatformInvites";
import type { Metadata } from "next";

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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Invite an operator</h1>
      <p className="text-sm text-muted-foreground">
        Somebody who helps you run AGENCIO — they see every customer and can suspend any
        of them. They choose their own password and you approve them; a link alone does
        not create an operator.
      </p>
    </div>

    <PlatformInvites />
  </div>
);

export default InviteOperatorPage;
