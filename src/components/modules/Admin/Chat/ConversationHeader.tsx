"use client"

import {
  addConversationMembersAction,
  leaveConversationAction,
} from "@/app/(dashboardLayout)/dashboard/chat/_action"
import PeoplePicker from "@/components/modules/Admin/Chat/PeoplePicker"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { plural } from "@/lib/text"
import type { IConversation } from "@/types/workspace.types"
import { Archive, LogOut, UserPlus } from "lucide-react"
import { useState } from "react"

type ConversationHeaderProps = {
  conversation: IConversation
  onArchive: () => void
  /** After leaving, the board lets go of the conversation. */
  onLeft: () => void
}

const describe = (conversation: IConversation) =>
  conversation.type === "direct" ? "Just the two of you" : plural(conversation.members.length, "person", "people")

// The open conversation's name and what can be done to it. Only a group takes
// new people or can be left; a direct thread is two people by definition.
const ConversationHeader = ({ conversation, onArchive, onLeft }: ConversationHeaderProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const isGroup = conversation.type === "group"

  const { run: addMembers, isPending: isAddingPending } = useActionMutation({
    action: (memberIds: string[]) => addConversationMembersAction(conversation.id, { member_ids: memberIds }),
    successMessage: `Added to ${conversation.name}`,
    invalidateKeys: [queryKeys.conversations.all],
    refresh: false,
  })

  // The API's "You have left the conversation" is the toast.
  const { run: leave, isPending: isLeavingPending } = useActionMutation({
    action: leaveConversationAction,
    invalidateKeys: [queryKeys.conversations.all],
    refresh: false,
  })

  const closeAdding = (open: boolean) => {
    setIsAdding(open)
    if (!open) setPicked([])
  }

  const handleAdd = async () => {
    if (await addMembers(picked)) closeAdding(false)
  }

  const handleLeave = async () => {
    if (!(await leave(conversation.id))) return
    setIsLeaving(false)
    onLeft()
  }

  const toggle = (id: string) =>
    setPicked((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
      <div>
        <p className="font-medium">{conversation.name}</p>
        <p className="text-xs text-muted-foreground">{describe(conversation)}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {isGroup && (
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(true)}>
            <UserPlus className="size-4" />
            Add people
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onArchive}>
          <Archive className="size-4" />
          {conversation.archived_at ? "Restore" : "Archive"}
        </Button>
        {isGroup && (
          <Button size="sm" variant="ghost" onClick={() => setIsLeaving(true)}>
            <LogOut className="size-4" />
            Leave
          </Button>
        )}
      </div>

      <Dialog open={isAdding} onOpenChange={closeAdding}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add people to {conversation.name}</DialogTitle>
            <DialogDescription>They see the conversation from the start, earlier messages included.</DialogDescription>
          </DialogHeader>

          <PeoplePicker
            label="Who to add"
            selected={picked}
            onToggle={toggle}
            excludeIds={conversation.members.map((member) => member.id)}
            disabled={isAddingPending}
          />

          <DialogFooter>
            <Button type="button" disabled={isAddingPending || picked.length === 0} onClick={() => void handleAdd()}>
              {picked.length > 0 ? `Add ${plural(picked.length, "person", "people")}` : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isLeaving}
        onOpenChange={setIsLeaving}
        title={`Leave ${conversation.name}?`}
        description="It leaves your list and you stop hearing about new messages. Somebody still in it can add you back."
        confirmLabel="Leave"
        pendingLabel="Leaving..."
        variant="destructive"
        isPending={isLeavingPending}
        onConfirm={() => void handleLeave()}
      />
    </div>
  )
}

export default ConversationHeader
