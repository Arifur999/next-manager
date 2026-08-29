import PlatformJoinForm from "@/components/modules/Auth/PlatformJoinForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the platform team",
};

// Reads a token from the URL, so it must never be cached.
export const dynamic = "force-dynamic";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Validated server-side before anything renders, so a dead link says so
 * immediately rather than after somebody has chosen a password.
 */
const loadInvite = async (token: string): Promise<{ email: string } | null> => {
  try {
    const res = await fetch(`${BASE_API_URL}/platform-join/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    return (body?.data as { email: string }) ?? null;
  } catch {
    // A backend that is down and an invite that is dead look identical from
    // here. "No longer valid" is the safer of the two things to say.
    return null;
  }
};

const PlatformJoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const invite = await loadInvite(token);

  return <PlatformJoinForm token={token} invite={invite} />;
};

export default PlatformJoinPage;
