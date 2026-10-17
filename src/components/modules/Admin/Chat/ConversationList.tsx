"use client"

import RelativeTime from "@/components/shared/RelativeTime"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IConversation } from "@/types/workspace.types"
import { MessagesSquare } from "lucide-react"
import type { ComponentProps } from "react"

/**
 * Every conversation, newest activity first.
 *
 * The unread count comes from the server, measured against how far this person
 * has read — not from anything counted here, so two tabs cannot disagree about
 * it.
 */
// What comes before the time: the project's code, or how many are in a group.
const contextOf = (conversation: IConversation) => {
  if (conversation.type === "project" && conversation.project) return `${conversation.project.code} · `
  if (conversation.type === "group") return `${conversation.members.length} people · `
  return ""
}

const ConversationList = ({
  conversations,
  query,
  activeId,
  onSelect,
}: {
  conversations: IConversation[]
  query: ComponentProps<typeof PanelState>["query"]
  activeId: string | null
  onSelect: (id: string) => void
}) => (
  <PanelState
    query={query}
    errorMessage="Your conversations did not load."
    isEmpty={conversations.length === 0}
    empty={<EmptyState icon={MessagesSquare}>Nothing here yet.</EmptyState>}
  >
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
              {contextOf(conversation)}
              <RelativeTime value={conversation.last_message_at} strict />
            </p>
          </button>
        </li>
      ))}
    </ul>
  </PanelState>
)

export default ConversationList
