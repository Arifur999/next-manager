import AgencyJoinForm from "@/components/modules/Auth/AgencyJoinForm";
import type { Metadata } from "next";
import { getApiBaseUrl } from "@/env"

export const metadata: Metadata = {
  title: "Open your agency",
};

// Reads a token from the URL, so it must never be cached.
export const dynamic = "force-dynamic";


export interface AgencyInvite {
  email: string;
  /** Empty when the owner names their own agency on the way in. */
  company_name: string;
  trial_days: number;
  /** Null when they arrive unprovisioned and somebody sets them up by hand. */
  plan: { name: string; price_usd: number } | null;
}

/**
 * Validated server-side before anything renders, so a dead link says so
 * immediately rather than after somebody has chosen a password and named a
 * company.
 */
const loadInvite = async (token: string): Promise<AgencyInvite | null> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/agency-join/${encodeURIComponent(token)}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const body = await res.json();
    return (body?.data as AgencyInvite) ?? null;
  } catch {
    // A backend that is down and an invite that is dead look identical from
    // here. "No longer valid" is the safer of the two things to say.
    return null;
  }
};

const AgencyJoinPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const invite = await loadInvite(token);

  return <AgencyJoinForm token={token} invite={invite} />;
};

export default AgencyJoinPage;
