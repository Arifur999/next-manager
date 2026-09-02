"use client"

import {
  createConversationAction,
  markConversationReadAction,
  sendMessageAction,
  setConversationArchivedAction,
} from "@/app/(dashboardLayout)/dashboard/chat/_action"
import ConversationList from "@/components/modules/Admin/Chat/ConversationList"
import MessageThread from "@/components/modules/Admin/Chat/MessageThread"
import NewConversationCard from "@/components/modules/Admin/Chat/NewConversationCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useChatSocket } from "@/hooks/useChatSocket"
import { getConversations, getMessages } from "@/services/agencio.services"
import type { IConversation, IMessage } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * Chat.
 *
 * Every sub-view the sidebar offers — Unread, Direct, Groups, Project,
 * Archived — is this one board reading a filter off the URL. Built as separate
 * pages it would be five copies of the same two queries and five places to fix
 * one bug.
 *
 * The socket only ever says "something changed"; the thread and the list are
 * refetched over HTTP. So a broken connection makes the page merely not live,
 * and never makes it wrong.
 */
const ChatBoard = ({ meId }: { meId: string | null }) => {
  const queryClient = useQueryClient()
  const params = useSearchParams()
  const [activeId, setActiveId] = useState<string | null>(null)

  // The filter is the URL, so a sub-view can be linked to and shared.
  const type = params.get("type") ?? undefined
  const unread = params.get("unread") === "true"
  const archived = params.get("archived") === "true"
  const query = new URLSearchParams({
    ...(type ? { type } : {}),
    ...(unread ? { unread: "true" } : {}),
    ...(archived ? { archived: "true" } : {}),
  }).toString()

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", query],
    queryFn: () => getConversations(query),
  })
  const conversations = (data?.data ?? []) as IConversation[]

  const { data: messageData, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => getMessages(activeId as string),
    enabled: Boolean(activeId),
  })
  const messages = (messageData?.data ?? []) as IMessage[]

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: ["conversations"] })
    // The navbar badge counts the same thing.
    void queryClient.invalidateQueries({ queryKey: ["chat-unread"] })
  }

  // A push is a hint, never the message itself: refetch rather than splice, so
  // what is on screen is always what the server actually stored.
  useChatSocket((event) => {
    if (event.type !== "message") return
    refreshLists()
    if (event.conversation_id === activeId) {
      void queryClient.invalidateQueries({ queryKey: ["messages", activeId] })
    }
  })

  // Opening a conversation is reading it.
  useEffect(() => {
    if (!activeId) return
    void markConversationReadAction(activeId).then(refreshLists)
    // refreshLists is stable enough for this: it only closes over queryClient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, messages.length])

  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: (body: string) => sendMessageAction(activeId as string, { body }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not send it")
        return
      }
      void queryClient.invalidateQueries({ queryKey: ["messages", activeId] })
      refreshLists()
    },
  })

  const { mutate: start, isPending: starting } = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createConversationAction(payload),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not start it")
        return
      }
      // Asking to talk to somebody you already have a thread with returns that
      // thread, so this opens the right one either way.
      //
      // `success` is a plain boolean rather than a discriminant on these types,
      // so the narrowing is done with `in` — the same way the rest of the
      // codebase does it.
      if ("data" in result) setActiveId(result.data.id)
      refreshLists()
    },
  })

  const { mutate: archive } = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      setConversationArchivedAction(id, value),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not archive it")
        return
      }
      toast.success(result.message)
      setActiveId(null)
      refreshLists()
    },
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card className="gap-0 overflow-hidden p-0">
        <NewConversationCard meId={meId} onCreate={start} isPending={starting} />
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          isLoading={isLoading}
          onSelect={setActiveId}
        />
      </Card>

      <Card className="flex h-[36rem] flex-col gap-0 overflow-hidden p-0">
        {active ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <div>
                <p className="font-medium">{active.name}</p>
                <p className="text-xs text-muted-foreground">
                  {active.type === "direct"
                    ? "Just the two of you"
                    : `${active.members.length} people`}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => archive({ id: active.id, value: !active.archived_at })}
              >
                <Archive className="size-4" />
                {active.archived_at ? "Restore" : "Archive"}
              </Button>
            </div>

            <MessageThread
              messages={messages}
              meId={meId}
              isLoading={loadingMessages}
              isSending={sending}
              onSend={(body) => send(body)}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Pick a conversation, or start one.
          </div>
        )}
      </Card>
    </div>
  )
}

export default ChatBoard
