"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { usersListQuery } from "@/queries/people.queries"
import type { IConversationFormValues } from "@/zod/workspace.validation"

const conversationDefaults: IConversationFormValues = { type: "direct", name: "", member_ids: [] }

/**
 * Starting a conversation.
 *
 * Direct asks for one person, a group asks for a name and any number. Asking to
 * talk to somebody you already have a thread with opens that thread rather than
 * making a second one — the server decides that from a sorted key of the two
 * ids, so it holds even if both people click at the same moment.
 */
const NewConversationCard = ({
  meId,
  onCreate,
  isPending,
}: {
  meId: string | null
  onCreate: (values: IConversationFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const { data } = useQuery(usersListQuery())
  const people = ((data?.data ?? [])).filter(
    (person) => person.status === "active" && person.id !== meId
  )

  const form = useForm({
    defaultValues: conversationDefaults,
    onSubmit: async ({ value, formApi }) => {
      // Cleared only once the conversation exists, so a refusal keeps the picks.
      if (!(await onCreate(value))) return

      formApi.reset({ ...conversationDefaults, type: value.type }, { keepDefaultValues: true })
    },
  })

  return (
    <form
      className="space-y-3 border-b p-4"
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
            <Label htmlFor="chat-type">Start something</Label>
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
                const pick = (id: string) => {
                  if (type === "direct") return field.handleChange([id])
                  field.handleChange(
                    selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id],
                  )
                }

                return (
                  <div className="space-y-1.5">
                    <Label>{type === "direct" ? "Who" : "Who is in it"}</Label>
                    <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1">
                      {people.map((person) => (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => pick(person.id)}
                          aria-pressed={selected.includes(person.id)}
                          className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                            selected.includes(person.id) ? "bg-primary/10 font-medium" : "hover:bg-muted"
                          }`}
                        >
                          {person.full_name}
                          <span className="ml-2 text-xs capitalize text-muted-foreground">
                            {person.role.replace(/_/g, " ")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              }}
            </form.Field>
          </>
        )}
      </form.Subscribe>

      <form.Subscribe
        selector={({ values }) =>
          values.member_ids.length > 0 &&
          (values.type === "direct" ? values.member_ids.length === 1 : values.name.trim() !== "")
        }
      >
        {(isReady) => (
          <Button type="submit" disabled={isPending || !isReady} className="w-full" size="sm">
            Start
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default NewConversationCard
