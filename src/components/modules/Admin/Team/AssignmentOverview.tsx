"use client"

import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { roleTitle } from "@/types/permission.types"
import { useQuery } from "@tanstack/react-query"
import { UsersRound } from "lucide-react"
import Link from "next/link"
import { assignmentOverviewQuery } from "@/queries/project.queries"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?"

/**
 * Who is on what, across the whole agency.
 *
 * Everyone appears, including people on nothing — that is usually the question
 * this screen is opened to answer, and a list of only the busy people cannot
 * answer it.
 */
const AssignmentOverview = () => {
  const assignmentList = useQuery(assignmentOverviewQuery())

  const people = assignmentList.data?.data ?? []

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <PanelState
        query={assignmentList}
        errorMessage="Assignments did not load."
        isEmpty={people.length === 0}
        empty={<EmptyState icon={UsersRound}>No team members yet.</EmptyState>}
      >
        <ul className="divide-y">
          {people.map((row) => (
            <li key={row.user.id} className="flex items-start gap-3 px-5 py-4">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="text-xs">{initialsOf(row.user.full_name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{row.user.full_name}</p>
                  <Badge variant="outline" className="text-xs">
                    {roleTitle(row.user.role)}
                  </Badge>
                </div>

                {row.assignments.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">Not on any project.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.assignments.map((assignment) => (
                      <Link
                        key={assignment.id}
                        href={`/admin/dashboard/projects/${assignment.project.id}`}
                        className="rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-muted"
                      >
                        {assignment.project.code}
                        {assignment.role_on_project && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {assignment.role_on_project}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Only live work counts — finished projects would make everyone
                  look permanently busy. */}
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {row.active_count} active
              </span>
            </li>
          ))}
        </ul>
      </PanelState>
    </Card>
  )
}

export default AssignmentOverview
