import JoinForm from "@/components/modules/Auth/JoinForm";
import type { IInvitePreview } from "@/types/agencio.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join a team",
};

// Reads a token from the URL, so it can never be cached — a cached page would
// show one person's invite to the next visitor.
export const dynamic = "force-dynamic";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Validated on the server before anything renders.
 *
 * A dead link should say so immediately rather than after somebody has chosen
 * a password, and the company name has to come from the API anyway — the token
 * is the only thing the browser has.
 */
const loadInvite = async (token: string): Promise<IInvitePreview | null> => {
  try {
    const res = await fetch(`${BASE_API_URL}/join/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    return (body?.data as IInvitePreview) ?? null;
  } catch {
    // A backend that is down and an invite that is dead look the same from
    // here. Treating both as "no longer valid" is the safer of the two lies.
    return null;
  }
};

const JoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const invite = await loadInvite(token);

  return <JoinForm token={token} invite={invite} />;
};

export default JoinPage;
