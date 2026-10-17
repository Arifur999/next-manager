"use client"

import PeoplePicker from "@/components/modules/Admin/Chat/PeoplePicker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IConversationFormValues } from "@/zod/workspace.validation"
import { useForm } from "@tanstack/react-form"
import { SquarePen } from "lucide-react"
import { useState } from "react"

const conversationDefaults: IConversationFormValues = { type: "direct", name: "", member_ids: [] }

type NewConversationFormProps = {
  meId: string | null
  onCreate: (values: IConversationFormValues) => Promise<boolean>
  isPending: boolean
  onDone: () => void
}

const NewConversationForm = ({ meId, onCreate, isPending, onDone }: NewConversationFormProps) => {
  const form = useForm({
    defaultValues: conversationDefaults,
    onSubmit: async ({ value }) => {
      // Closed only once the conversation exists, so a refusal keeps the picks.
      if (await onCreate(value)) onDone()
    },
  })

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="type">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor="chat-type">Kind</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value === "group" ? "group" : "direct")
                // A direct thread holds one other person; keeping a longer
                // selection would send a request the server has to refuse.
                form.setFieldValue("member_ids", [])
              }}
              disabled={isPending}
            >
              <SelectTrigger id="chat-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct message</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={({ values }) => values.type}>
        {(type) => (
          <>
            {type === "group" && (
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="chat-name">Name</Label>
                    <Input
                      id="chat-name"
                      value={field.state.value}
                      maxLength={120}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Studio"
                      disabled={isPending}
                    />
                  </div>
                )}
              </form.Field>
            )}

            <form.Field name="member_ids">
              {(field) => {
                const selected = field.state.value
                const toggle = (id: string) => {
                  if (type === "direct") return field.handleChange([id])
                  field.handleChange(
                    selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id],
                  )
                }

                return (
                  <PeoplePicker
                    label={type === "direct" ? "Who" : "Who is in it"}
                    selected={selected}
                    onToggle={toggle}
                    excludeIds={meId ? [meId] : []}
                    disabled={isPending}
                  />
                )
              }}
            </form.Field>
          </>
        )}
      </form.Subscribe>

      <DialogFooter>
        <form.Subscribe
          selector={({ values }) =>
            values.member_ids.length > 0 &&
            (values.type === "direct" ? values.member_ids.length === 1 : values.name.trim() !== "")
          }
        >
          {(isReady) => (
            <Button type="submit" disabled={isPending || !isReady}>
              Start
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}

/**
 * Starting a conversation, in a dialog so the list keeps its place.
 *
 * Direct asks for one person, a group asks for a name and any number. Asking to
 * talk to somebody you already have a thread with opens that thread rather than
 * making a second one — the server decides that from a sorted key of the two
 * ids, so it holds even if both people click at the same moment.
 */
const NewConversationDialog = (props: Omit<NewConversationFormProps, "onDone">) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="w-full">
          <SquarePen className="size-4" />
          New conversation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>A direct message with one colleague, or a named group.</DialogDescription>
        </DialogHeader>

        {open && <NewConversationForm {...props} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

export default NewConversationDialog
