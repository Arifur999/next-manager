import AgencyJoinForm from "@/components/modules/Auth/AgencyJoinForm";
import InvalidInviteCard from "@/components/modules/Auth/InvalidInviteCard";
import LinkCheckFailedCard from "@/components/modules/Auth/LinkCheckFailedCard";
import { lookupLinkToken } from "@/services/auth.services";
import { agencyInvitePreviewZodSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open your agency",
  robots: { index: false, follow: false },
};

// Reads a token from the URL, so it must never be cached.
export const dynamic = "force-dynamic";

// Checked on the server before anything renders, so a dead link says so before
// somebody has chosen a password and named a company.
const AgencyJoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const lookup = await lookupLinkToken(`/agency-join/${encodeURIComponent(token)}`, agencyInvitePreviewZodSchema);

  if (lookup.status === "gone") return <InvalidInviteCard />;
  if (lookup.status === "unavailable") return <LinkCheckFailedCard subject="invite" />;
  return <AgencyJoinForm token={token} invite={lookup.data} />;
};

export default AgencyJoinPage;
