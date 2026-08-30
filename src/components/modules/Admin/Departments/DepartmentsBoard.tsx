"use client"

import {
  createDepartmentAction,
  deleteDepartmentAction,
  updateDepartmentAction,
} from "@/app/(dashboardLayout)/admin/dashboard/departments/_action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDepartments } from "@/services/agencio.services"
import type { IDepartment } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Network, Plus, Power, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The teams inside the agency.
 *
 * Deliberately small. A department is a name and whether it is still in use;
 * everything that makes it useful lives somewhere else — the people list, the
 * payout filter, the delivery report. A configuration screen that grows
 * features is one people go to instead of the place the work happens.
 *
 * Turning one off is offered beside deleting it, because that is what the
 * server tells you to do the moment anybody is in it, and the pair reads better
 * than a refusal followed by hunting for the switch.
 */

const DepartmentsBoard = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  })

  const departments = (data?.data ?? []) as IDepartment[]
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["departments"] })

  const reset = () => {
    setName("")
    setDescription("")
    setEditingId(null)
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      editingId
        ? updateDepartmentAction(editingId, { name: name.trim(), description: description.trim() })
        : createDepartmentAction({ name: name.trim(), description: description.trim() }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not save it")
        return
      }
      toast.success(editingId ? "Department updated" : "Department added")
      reset()
      void refresh()
    },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (department: IDepartment) =>
      updateDepartmentAction(department.id, { is_active: !department.is_active }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not change it")
        return
      }
      void refresh()
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteDepartmentAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        // "4 people are in Design. Move them first, or turn it off instead of
        // deleting it." — the server already says what to do, so it is shown
        // rather than replaced with a shorter, useless sentence.
        toast.error(result.message || "Could not delete it")
        return
      }
      toast.success("Department deleted")
      if (editingId) reset()
      void refresh()
    },
  })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="size-4" aria-hidden="true" />
            {editingId ? "Edit department" : "New department"}
          </CardTitle>
        </CardHeader>

        <form
          className="space-y-4 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            save()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="department-name">Name</Label>
            <Input
              id="department-name"
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Design"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="department-description">What they do</Label>
            <Input
              id="department-description"
              value={description}
              maxLength={200}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending || !name.trim()} className="flex-1">
              <Plus className="size-4" />
              {editingId ? "Save changes" : "Add"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Stop editing">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>

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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(department.id)
                        setName(department.name)
                        setDescription(department.description)
                      }}
                    >
                      Edit
                    </Button>

                    {/* Beside delete, because this is what the server tells you
                        to do the moment anybody is in it. */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggle(department)}
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
                      onClick={() => remove(department.id)}
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
    </div>
  )
}

export default DepartmentsBoard
