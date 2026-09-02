"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IConversation } from "@/types/agencio.types"
import { formatDistanceToNowStrict, parseISO } from "date-fns"
import { MessagesSquare } from "lucide-react"

/**
 * Every conversation, newest activity first.
 *
 * The unread count comes from the server, measured against how far this person
 * has read — not from anything counted here, so two tabs cannot disagree about
 * it.
 */
const ConversationList = ({
  conversations,
  activeId,
  isLoading,
  onSelect,
}: {
  conversations: IConversation[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
}) => {
  if (isLoading && conversations.length === 0) return <LoadingBlock />

  if (conversations.length === 0) {
    return <EmptyState icon={MessagesSquare}>Nothing here yet.</EmptyState>
  }

  return (
    <ul className="divide-y">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelect(conversation.id)}
            aria-current={conversation.id === activeId ? "true" : undefined}
            className={cn(
              "w-full px-4 py-3 text-left transition-colors hover:bg-muted/60",
              conversation.id === activeId && "bg-muted"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{conversation.name}</span>
              {conversation.unread_count > 0 && (
                <Badge className="shrink-0">{conversation.unread_count}</Badge>
              )}
            </div>

            <p className="truncate text-xs text-muted-foreground">
              {conversation.last_message ? (
                <>
                  {conversation.last_message.sender?.full_name
                    ? `${conversation.last_message.sender.full_name}: `
                    : ""}
                  {conversation.last_message.body}
                </>
              ) : (
                "No messages yet"
              )}
            </p>

            <p className="text-[11px] text-muted-foreground">
              {conversation.type === "project" && conversation.project
                ? `${conversation.project.code} · `
                : conversation.type === "group"
                  ? `${conversation.members.length} people · `
                  : ""}
              {formatDistanceToNowStrict(parseISO(conversation.last_message_at), {
                addSuffix: true,
              })}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ConversationList
