import LoginHistory from "@/components/modules/Admin/Security/LoginHistory";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { loginEventsListQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Security",
};

// No _action.ts, and there will not be one: the API is GET-only, because a
// security log somebody can edit proves nothing.
const SecurityPage = async () => {

  const prefetch = (queryClient: QueryClient) => queryClient.prefetchQuery(loginEventsListQuery());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground">
          Who signed in, from where, and what was refused. Attempts on addresses that have
          no account here are not shown — they belong to no company.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        <LoginHistory />
      </QueryPrefetch>
    </div>
  );
};

export default SecurityPage;
