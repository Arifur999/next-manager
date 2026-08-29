import PlatformSettings from "@/components/modules/Platform/PlatformSettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">
        How this installation is set up: what it calls itself in the mail it sends, who
        customers write to, and what a company that signs itself up is put on.
      </p>
    </div>

    <PlatformSettings />
  </div>
);

export default SettingsPage;
