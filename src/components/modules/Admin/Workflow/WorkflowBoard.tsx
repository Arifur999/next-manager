"use client"

import {
  createWorkflowStatusAction,
  deleteWorkflowStatusAction,
  updateWorkflowStatusAction,
} from "@/app/(dashboardLayout)/admin/dashboard/workflow/_action"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getWorkflowStatuses } from "@/services/agencio.services"
import type { IWorkflowStatus, StatusCategory } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Plus, Power, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The columns on one board, and what each of them means.
 *
 * The name is yours. The meaning is what the product reasons about — four
 * places derive behaviour from it rather than from the label, so renaming
 * "Done" to "Shipped" keeps completion dates working and adding "In QA" as
 * `active` keeps that work counted as in flight.
 *
 * Which is why the meaning is a required choice and never guessed from the
 * name. A status whose meaning was inferred would change meaning the day
 * somebody edited its label.
 */

const CATEGORIES: Array<{ value: StatusCategory; label: string; blurb: string }> = [
  { value: "open", label: "Not started", blurb: "Waiting to be picked up." },
  { value: "active", label: "In progress", blurb: "Being worked on. Counts as in flight." },
  { value: "blocked", label: "Blocked", blurb: "Stopped, but not finished." },
  {
    value: "done",
    label: "Finished",
    blurb: "Counts as delivered, and stops the clock on a task.",
  },
  {
    value: "cancelled",
    label: "Abandoned",
    blurb: "Finished, but not delivered. Not counted as done.",
  },
]

const WorkflowBoard = ({ kind }: { kind: "task" | "project" }) => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<StatusCategory>("open")

  const { data, isLoading } = useQuery({
    queryKey: ["workflow-statuses", kind],
    queryFn: () => getWorkflowStatuses(`kind=${kind}`),
  })

  const statuses = (data?.data ?? []) as IWorkflowStatus[]
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["workflow-statuses"] })

  const { mutate: add, isPending: isAdding } = useMutation({
    mutationFn: () => createWorkflowStatusAction({ kind, name: name.trim(), category }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not add it")
        return
      }
      toast.success("Added to the end of the board")
      setName("")
      void refresh()
    },
  })

  const { mutate: change } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateWorkflowStatusAction(id, payload),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not change it")
        return
      }
      void refresh()
    },
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteWorkflowStatusAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        // "4 tasks are on In QA. Move them first, or turn it off instead of
        // deleting it." — the server already says what to do.
        toast.error(result.message || "Could not remove it")
        return
      }
      toast.success("Removed from the board")
      void refresh()
    },
  })

  // Swapping two sort_orders rather than renumbering the board: fewer writes,
  // and the rest of the columns keep the positions somebody chose.
  const move = (index: number, direction: -1 | 1) => {
    const current = statuses[index]
    const neighbour = statuses[index + direction]
    if (!current || !neighbour) return

    change({ id: current.id, payload: { sort_order: neighbour.sort_order } })
    change({ id: neighbour.id, payload: { sort_order: current.sort_order } })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">New column</CardTitle>
        </CardHeader>

        <form
          className="space-y-4 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            add()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="status-name">Name</Label>
            <Input
              id="status-name"
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder={kind === "task" ? "In QA" : "Awaiting sign-off"}
              disabled={isAdding}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status-category">What it means</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as StatusCategory)}
            >
              <SelectTrigger id="status-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {CATEGORIES.find((option) => option.value === category)?.blurb}
            </p>
          </div>

          <Button type="submit" disabled={isAdding || !name.trim()} className="w-full">
            <Plus className="size-4" />
            Add
          </Button>

          <p className="text-xs text-muted-foreground">
            The name is yours to change later. What it means is what the reports and the
            completion dates read, so that is asked for up front rather than guessed from
            the name.
          </p>
        </form>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">
            {kind === "task" ? "Task board" : "Project board"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Left to right, in the order work moves through them.
          </p>
        </CardHeader>

        {isLoading && statuses.length === 0 ? (
          <div className="h-40 animate-pulse bg-muted/40" />
        ) : (
          <ul className="divide-y">
            {statuses.map((status, index) => {
              const inUse = (status._count?.tasks ?? 0) + (status._count?.projects ?? 0)
              const meaning = CATEGORIES.find((option) => option.value === status.category)

              return (
                <li
                  key={status.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-48">
                    <p className="flex items-center gap-2 font-medium">
                      {status.name}
                      {status.is_default && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="size-3" aria-hidden="true" />
                          new work starts here
                        </Badge>
                      )}
                      {!status.is_active && <Badge variant="outline">off</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span
                        className={`mr-1.5 rounded px-1.5 py-0.5 ${STATUS_TONE[status.category]}`}
                      >
                        {meaning?.label}
                      </span>
                      {inUse === 0
                        ? "nothing on it"
                        : `${inUse} ${inUse === 1 ? "item" : "items"} on it`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={`Move ${status.name} earlier`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === statuses.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={`Move ${status.name} later`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>

                    {!status.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => change({ id: status.id, payload: { is_default: true } })}
                      >
                        Start here
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        change({ id: status.id, payload: { is_active: !status.is_active } })
                      }
                      aria-label={
                        status.is_active ? `Turn off ${status.name}` : `Turn on ${status.name}`
                      }
                      title={status.is_active ? "Turn off" : "Turn on"}
                    >
                      <Power className="size-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(status.id)}
                      aria-label={`Delete ${status.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Turning a column off keeps the work that is already on it and stops anything new
          going there. Deleting one is refused while anything is on it.
        </div>
      </Card>
    </div>
  )
}

export default WorkflowBoard
