import PlatformSettings from "@/components/modules/Platform/PlatformSettings";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Settings">
      How this installation is set up: what it calls itself in the mail it sends, who
      customers write to, and what a company that signs itself up is put on.
    </PageHeader>

    <PlatformSettings />
  </div>
);

export default SettingsPage;
