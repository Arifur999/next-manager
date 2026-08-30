import LoginHistory from "@/components/modules/Admin/Security/LoginHistory";
import { getLoginEvents } from "@/services/agencio.services";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
};

// No _action.ts, and there will not be one: the API is GET-only, because a
// security log somebody can edit proves nothing.
const SecurityPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["login-events", ""],
    queryFn: () => getLoginEvents(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground">
          Who signed in, from where, and what was refused. Attempts on addresses that have
          no account here are not shown — they belong to no company.
        </p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <LoginHistory />
      </HydrationBoundary>
    </div>
  );
};

export default SecurityPage;
