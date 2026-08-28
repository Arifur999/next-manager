"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getAssignmentOverview } from "@/services/agencio.services"
import type { IAssignmentRow } from "@/types/agencio.types"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

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
  const { data, isLoading } = useQuery({
    queryKey: ["assignment-overview"],
    queryFn: () => getAssignmentOverview(),
  })

  const rows = (data?.data ?? []) as IAssignmentRow[]

  if (isLoading && rows.length === 0) {
    return <Card className="h-64 animate-pulse bg-muted/40" />
  }

  if (rows.length === 0) {
    return (
      <Card className="px-6 py-16 text-center text-sm text-muted-foreground">
        No team members yet.
      </Card>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <ul className="divide-y">
        {rows.map((row) => (
          <li key={row.user.id} className="flex items-start gap-3 px-5 py-4">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="text-xs">{initialsOf(row.user.full_name)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{row.user.full_name}</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {row.user.role.replace(/_/g, " ")}
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
    </Card>
  )
}

export default AssignmentOverview
