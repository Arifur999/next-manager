import InvalidInviteCard from "@/components/modules/Auth/InvalidInviteCard";
import JoinForm from "@/components/modules/Auth/JoinForm";
import LinkCheckFailedCard from "@/components/modules/Auth/LinkCheckFailedCard";
import { lookupLinkToken } from "@/services/auth.services";
import { invitePreviewZodSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join a team",
  robots: { index: false, follow: false },
};

// Reads a token from the URL, so it can never be cached — a cached page would
// show one person's invite to the next visitor.
export const dynamic = "force-dynamic";

// Checked on the server before anything renders: a dead link says so before
// somebody chooses a password, and the company name has to come from the API
// anyway, since the token is the only thing the browser has.
const JoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const lookup = await lookupLinkToken(`/join/${encodeURIComponent(token)}`, invitePreviewZodSchema);

  if (lookup.status === "gone") return <InvalidInviteCard />;
  if (lookup.status === "unavailable") return <LinkCheckFailedCard subject="invite" />;
  return <JoinForm token={token} invite={lookup.data} />;
};

export default JoinPage;
