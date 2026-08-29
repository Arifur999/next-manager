import PlatformInvites from "@/components/modules/Platform/PlatformInvites";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite admin",
};

const InviteAdminPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Invite admin</h1>
      <p className="text-sm text-muted-foreground">
        Bring somebody onto the platform team. They choose their own password and you
        approve them — a link alone does not create an operator.
      </p>
    </div>

    <PlatformInvites />
  </div>
);

export default InviteAdminPage;
