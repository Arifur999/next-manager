import ChatBoard from "@/components/modules/Admin/Chat/ChatBoard";
import { getUserInfo } from "@/services/auth.services";
import type { QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { conversationsListQuery } from "@/queries/workspace.queries";
import QueryPrefetch from "@/components/shared/QueryPrefetch";

export const metadata: Metadata = {
  title: "Chat",
};

const ChatPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;

  // The same query string the board builds from the URL, so the prefetch lands
  // on the key it will actually ask for. Without this the first paint is an
  // empty list that fills in a moment later, on every sub-view.
  const query = new URLSearchParams({
    ...(typeof params.type === "string" ? { type: params.type } : {}),
    ...(params.unread === "true" ? { unread: "true" } : {}),
    ...(params.archived === "true" ? { archived: "true" } : {}),
  }).toString();

  // `meId` tells your own messages from everybody else's. It is never a
  // permission: who may read a conversation is decided by the server from a
  // membership row, on every single call.
  const user = await getUserInfo();

  const prefetch = (queryClient: QueryClient) => Promise.all([
    queryClient.prefetchQuery(conversationsListQuery(query)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Direct messages, groups and project threads. Messages are stored before they are
          sent live, so a dropped connection makes this page stop updating on its own —
          it never loses anything.
        </p>
      </div>

      <QueryPrefetch prefetch={prefetch}>
        {/* The board reads its filter from the URL, which needs a Suspense
            boundary around useSearchParams. */}
        <Suspense fallback={null}>
          <ChatBoard meId={user?.id ?? null} />
        </Suspense>
      </QueryPrefetch>
    </div>
  );
};

export default ChatPage;
