import PlatformTeam from "@/components/modules/Platform/PlatformTeam";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Permissions",
};

const PermissionsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Permissions">
      Who is on the platform team and what each of them may do. Everyone here can see
      every customer, so keep it short.
    </PageHeader>

    <PlatformTeam />
  </div>
);

export default PermissionsPage;
