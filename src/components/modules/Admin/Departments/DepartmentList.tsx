"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IDepartment } from "@/types/people.types"
import { Network, Power, Trash2 } from "lucide-react"
import Link from "next/link"

// The departments, each with how many people are in it and its row actions.
const DepartmentList = ({
  departments,
  isLoading,
  onEdit,
  onToggle,
  onDelete,
}: {
  departments: IDepartment[]
  isLoading: boolean
  onEdit: (department: IDepartment) => void
  onToggle: (department: IDepartment) => void
  onDelete: (department: IDepartment) => void
}) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Teams</CardTitle>
      <p className="text-sm text-muted-foreground">
        Put people in one from the{" "}
        <Link
          href="/admin/dashboard/team-management"
          className="text-primary underline-offset-4 hover:underline"
        >
          Users
        </Link>{" "}
        page. Hours and cost are then split by team on the delivery report.
      </p>
    </CardHeader>

    {isLoading && departments.length === 0 ? (
      <div className="h-40 animate-pulse bg-muted/40" />
    ) : departments.length === 0 ? (
      <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
        <Network className="size-7" aria-hidden="true" />
        No departments yet. Everyone shows up as &quot;No department&quot; until there
        are some.
      </p>
    ) : (
      <ul className="divide-y">
        {departments.map((department) => {
          const members = department._count?.members ?? 0

          return (
            <li
              key={department.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-48">
                <p className="flex items-center gap-2 font-medium">
                  {department.name}
                  {!department.is_active && <Badge variant="outline">off</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {members === 0
                    ? "nobody yet"
                    : `${members} ${members === 1 ? "person" : "people"}`}
                  {department.description ? ` · ${department.description}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(department)}>
                  Edit
                </Button>

                {/* Beside delete, because this is what the server tells you
                    to do the moment anybody is in it. */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggle(department)}
                  aria-label={
                    department.is_active
                      ? `Turn off ${department.name}`
                      : `Turn on ${department.name}`
                  }
                  title={department.is_active ? "Turn off" : "Turn on"}
                >
                  <Power className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(department)}
                  aria-label={`Delete ${department.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    )}
  </Card>
)

export default DepartmentList
