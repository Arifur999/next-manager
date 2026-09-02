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
import { getAllUsers } from "@/services/user.services"
import type { IUser } from "@/types/user.types"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

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
  onCreate: (payload: Record<string, unknown>) => void
  isPending: boolean
}) => {
  const [type, setType] = useState<"direct" | "group">("direct")
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const { data } = useQuery({ queryKey: ["users"], queryFn: () => getAllUsers() })
  const people = ((data?.data ?? []) as IUser[]).filter(
    (person) => person.status === "active" && person.id !== meId
  )

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )

  const submit = () => {
    onCreate({
      type,
      ...(type === "group" ? { name: name.trim() } : {}),
      member_ids: selected,
    })
    setName("")
    setSelected([])
  }

  const ready = selected.length > 0 && (type === "direct" ? selected.length === 1 : name.trim())

  return (
    <form
      className="space-y-3 border-b p-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready) return
        submit()
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="chat-type">Start something</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value as "direct" | "group")
            // A direct thread holds one other person; keeping a longer
            // selection would send a request the server has to refuse.
            setSelected([])
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

      {type === "group" && (
        <div className="space-y-1.5">
          <Label htmlFor="chat-name">Name</Label>
          <Input
            id="chat-name"
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="Studio"
            disabled={isPending}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>{type === "direct" ? "Who" : "Who is in it"}</Label>
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1">
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => (type === "direct" ? setSelected([person.id]) : toggle(person.id))}
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

      <Button type="submit" disabled={isPending || !ready} className="w-full" size="sm">
        Start
      </Button>
    </form>
  )
}

export default NewConversationCard
