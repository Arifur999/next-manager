"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { IMessage } from "@/types/agencio.types"
import { format, parseISO } from "date-fns"
import { MessageSquare, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/**
 * One conversation, read and written.
 *
 * Sending is an HTTP request, always. The socket only tells the page something
 * changed — so a message can never be lost by a connection dropping mid-send,
 * and the worst a broken socket does is make the thread stop updating on its
 * own.
 *
 * Scrolls to the bottom when the thread changes or grows, because a chat opened
 * halfway up its own history is a chat nobody can use.
 */
const MessageThread = ({
  messages,
  meId,
  isLoading,
  isSending,
  onSend,
}: {
  messages: IMessage[]
  meId: string | null
  isLoading: boolean
  isSending: boolean
  onSend: (body: string) => void
}) => {
  const [draft, setDraft] = useState("")
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading && messages.length === 0 ? (
          <LoadingBlock />
        ) : messages.length === 0 ? (
          <EmptyState icon={MessageSquare}>Say something.</EmptyState>
        ) : (
          messages.map((message) => {
            const mine = message.sender?.id === meId

            return (
              <div
                key={message.id}
                className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {/* Groups need to say who spoke; a direct thread has only
                      two people in it and saying so every line is noise. */}
                  {!mine && message.sender && (
                    <p className="mb-0.5 text-[11px] opacity-70">{message.sender.full_name}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {format(parseISO(message.created_at), "d MMM, HH:mm")}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottom} />
      </div>

      <form
        className="flex items-center gap-2 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault()
          const body = draft.trim()
          if (!body) return
          onSend(body)
          setDraft("")
        }}
      >
        <Input
          value={draft}
          maxLength={4000}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message"
          aria-label="Write a message"
          disabled={isSending}
        />
        <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

export default MessageThread
