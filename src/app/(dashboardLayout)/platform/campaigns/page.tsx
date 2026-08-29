import CampaignBoard from "@/components/modules/Platform/CampaignBoard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns",
};

const CampaignsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
      <p className="text-sm text-muted-foreground">
        Notices to your customers. They appear in the bell inside the product, and can
        be emailed as well — an Eid offer, a price change, Sunday maintenance.
      </p>
    </div>

    <CampaignBoard />
  </div>
);

export default CampaignsPage;
