import InvalidInviteCard from "@/components/modules/Auth/InvalidInviteCard";
import LinkCheckFailedCard from "@/components/modules/Auth/LinkCheckFailedCard";
import PlatformJoinForm from "@/components/modules/Auth/PlatformJoinForm";
import { lookupLinkToken } from "@/services/auth.services";
import { platformInvitePreviewZodSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the platform team",
  robots: { index: false, follow: false },
};

// Reads a token from the URL, so it must never be cached.
export const dynamic = "force-dynamic";

// Checked on the server before anything renders, so a dead link says so before
// somebody chooses a password.
const PlatformJoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const lookup = await lookupLinkToken(`/platform-join/${encodeURIComponent(token)}`, platformInvitePreviewZodSchema);

  if (lookup.status === "gone") return <InvalidInviteCard />;
  if (lookup.status === "unavailable") return <LinkCheckFailedCard subject="invite" />;
  return <PlatformJoinForm token={token} invite={lookup.data} />;
};

export default PlatformJoinPage;
