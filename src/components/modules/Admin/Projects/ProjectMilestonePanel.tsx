"use client"

import {
  acceptMilestoneAction,
  createMilestoneAction,
  deleteMilestoneAction,
  reopenMilestoneAction,
  submitMilestoneAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_milestoneAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMilestones } from "@/services/agencio.services"
import type { IMilestone } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, isAfter, parseISO } from "date-fns"
import { CalendarCheck, Plus, Trash2, Undo2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * The dated promises inside one project.
 *
 * On-time delivery is counted here rather than on the project's end date: a
 * project that lands its final date after every interim date slipped is not on
 * time in any sense the client recognises.
 *
 * Late is computed from submitted_at against due_date, and shown on the row
 * itself. A milestone delivered three days late that nobody ever labelled late
 * is how an on-time rate quietly becomes fiction.
 */

const dayOf = (value: string) => parseISO(value.slice(0, 10))

type Status = {
  label: string
  late: boolean
  tone: "outline" | "secondary" | "destructive"
}

const statusOf = (milestone: IMilestone): Status => {
  if (milestone.submitted_at) {
    const late = isAfter(dayOf(milestone.submitted_at), dayOf(milestone.due_date))

    if (milestone.accepted_at) {
      return { label: late ? "accepted, late" : "accepted", late, tone: late ? "destructive" : "secondary" }
    }

    // Submitted and waiting. Worth its own state: delivered is not done, and
    // rolling the two together hides work sitting on a client's desk.
    return { label: late ? "submitted, late" : "submitted", late, tone: late ? "destructive" : "outline" }
  }

  if (isAfter(new Date(), dayOf(milestone.due_date))) {
    return { label: "overdue", late: true, tone: "destructive" }
  }

  return { label: "due", late: false, tone: "outline" }
}

const ProjectMilestonePanel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["milestones", `project_id=${projectId}`],
    queryFn: () => getMilestones(`project_id=${projectId}`),
  })

  const milestones = (data?.data ?? []) as IMilestone[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["milestones"] })
  }

  const run = (label: string) => ({
    onSuccess: (result: { success: boolean; message?: string }) => {
      if (!result.success) {
        toast.error(result.message || `Failed to ${label}`)
        return
      }
      refresh()
    },
  })

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: () =>
      createMilestoneAction({ project_id: projectId, title: title.trim(), due_date: dueDate }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Failed to add the milestone")
        return
      }
      toast.success("Milestone added")
      setTitle("")
      setDueDate("")
      refresh()
    },
  })

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: (id: string) => submitMilestoneAction(id),
    ...run("submit"),
  })

  const { mutate: accept, isPending: isAccepting } = useMutation({
    mutationFn: (id: string) => acceptMilestoneAction(id),
    ...run("accept"),
  })

  const { mutate: reopen, isPending: isReopening } = useMutation({
    mutationFn: (id: string) => reopenMilestoneAction(id),
    ...run("reopen"),
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => deleteMilestoneAction(id),
    ...run("delete"),
  })

  const isBusy = isSubmitting || isAccepting || isReopening || isRemoving

  const delivered = milestones.filter((milestone) => milestone.submitted_at)
  const onTime = delivered.filter((milestone) => !statusOf(milestone).late)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Milestones</CardTitle>
          <p className="text-sm text-muted-foreground">
            {delivered.length === 0
              ? "Nothing delivered yet."
              : /* Stated as a fraction, not a percentage. "2 of 3" is honest
                   about how few it is computed from; "67%" is not. */
                `${onTime.length} of ${delivered.length} delivered on time`}
          </p>
        </div>
      </CardHeader>

      <form
        className="flex flex-wrap items-end gap-3 border-b px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!title.trim() || !dueDate) return
          create()
        }}
      >
        <div className="min-w-48 flex-1 space-y-1.5">
          <Label htmlFor="milestone-title">Milestone</Label>
          <Input
            id="milestone-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Design handover"
            disabled={isCreating}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="milestone-due">Due</Label>
          <Input
            id="milestone-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isCreating}
          />
        </div>

        <Button type="submit" disabled={isCreating || !title.trim() || !dueDate}>
          <Plus className="size-4" />
          Add
        </Button>
      </form>

      {isLoading && milestones.length === 0 ? (
        <div className="h-32 animate-pulse bg-muted/40" />
      ) : milestones.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <CalendarCheck className="size-7" aria-hidden="true" />
          No milestones yet. Without a dated promise there is nothing to be on time for.
        </p>
      ) : (
        <ul className="divide-y">
          {milestones.map((milestone) => {
            const state = statusOf(milestone)

            return (
              <li
                key={milestone.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{milestone.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Due {format(dayOf(milestone.due_date), "dd MMM yyyy")}
                    {milestone.submitted_at
                      ? ` · submitted ${format(dayOf(milestone.submitted_at), "dd MMM")}`
                      : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={state.tone} className="text-xs">
                    {state.label}
                  </Badge>

                  {!milestone.submitted_at && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => submit(milestone.id)}
                    >
                      Submit
                    </Button>
                  )}

                  {milestone.submitted_at && !milestone.accepted_at && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => accept(milestone.id)}
                    >
                      Accept
                    </Button>
                  )}

                  {milestone.submitted_at && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => reopen(milestone.id)}
                      title="Undo the submission so it can be corrected"
                    >
                      <Undo2 className="size-3.5" />
                      <span className="sr-only">Reopen</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => remove(milestone.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default ProjectMilestonePanel
