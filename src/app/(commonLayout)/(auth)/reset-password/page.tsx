import LinkCheckFailedCard from "@/components/modules/Auth/LinkCheckFailedCard";
import ResetLinkCard from "@/components/modules/Auth/ResetLinkCard";
import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";
import { checkResetLink } from "@/services/auth.services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

// The token is checked before the form renders, so an expired or spent link
// says so before anybody types a new password twice. Reading searchParams
// makes this render per request, which a page holding a token must be anyway.
const ResetPasswordPage = async ({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) => {
  const { token } = await searchParams;
  // A mail client that breaks the link across two lines drops the token.
  if (typeof token !== "string" || token === "") return <ResetLinkCard reason="incomplete" />;

  const lookup = await checkResetLink(token);
  if (lookup.status === "gone") return <ResetLinkCard reason="expired" />;
  if (lookup.status === "unavailable") return <LinkCheckFailedCard subject="link" />;
  return <ResetPasswordForm token={token} />;
};

export default ResetPasswordPage;
