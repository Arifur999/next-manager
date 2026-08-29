import PlatformTeam from "@/components/modules/Platform/PlatformTeam";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permissions",
};

const PermissionsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
      <p className="text-sm text-muted-foreground">
        Who is on the platform team and what each of them may do. Everyone here can see
        every customer, so keep it short.
      </p>
    </div>

    <PlatformTeam />
  </div>
);

export default PermissionsPage;
