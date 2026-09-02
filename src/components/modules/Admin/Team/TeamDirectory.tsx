"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAllUsers } from "@/services/user.services"
import type { IUser } from "@/types/user.types"
import { useQuery } from "@tanstack/react-query"
import { UsersRound } from "lucide-react"
import { useState } from "react"

/**
 * Who works here, and how to reach them.
 *
 * Not the team management screen. That one creates, edits and deactivates
 * people; this one only reads — and the API backs that up by handing anybody
 * who is not running the team a narrower projection with no permissions and no
 * status on it. So there is nothing here to hide behind a role check, because
 * the sensitive fields never arrive.
 *
 * Filtering is done in the browser rather than by refetching: a directory is
 * one small list that is already loaded, and a round trip per keystroke would
 * make it feel slower than the paper one.
 */
const TeamDirectory = () => {
  const [term, setTerm] = useState("")

  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: () => getAllUsers() })
  const people = (data?.data ?? []) as IUser[]

  const needle = term.trim().toLowerCase()
  const shown = needle
    ? people.filter((person) =>
        [person.full_name, person.email, person.department?.name, person.role]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle))
      )
    : people

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Team directory</CardTitle>
          <p className="text-sm text-muted-foreground">
            {people.length} {people.length === 1 ? "person" : "people"}. Names, roles and how
            to reach them — what somebody is allowed to do is not directory business.
          </p>
        </div>

        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Find somebody"
          aria-label="Find somebody"
          className="max-w-sm"
        />
      </CardHeader>

      {isLoading && people.length === 0 ? (
        <LoadingBlock />
      ) : shown.length === 0 ? (
        <EmptyState icon={UsersRound}>
          {needle ? "Nobody by that name." : "Nobody here yet."}
        </EmptyState>
      ) : (
        <ul className="divide-y">
          {shown.map((person) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-48 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {person.full_name}
                  <Badge variant="outline" className="capitalize">
                    {person.role.replace(/_/g, " ")}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {person.email}
                  {person.phone ? ` · ${person.phone}` : ""}
                  {/* Null is a real answer: somebody can work here without
                      belonging to a department. */}
                  {person.department?.name ? ` · ${person.department.name}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default TeamDirectory
