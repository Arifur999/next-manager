import CampaignBoard from "@/components/modules/Platform/CampaignBoard";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Campaigns",
};

const CampaignsPage = () => (
  <div className="space-y-6">
    <PageHeader title="Campaigns">
      Notices to your customers. They appear in the bell inside the product, and can
      be emailed as well — an Eid offer, a price change, Sunday maintenance.
    </PageHeader>

    <CampaignBoard />
  </div>
);

export default CampaignsPage;
