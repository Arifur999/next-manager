"use client"

import {
  acceptMilestoneAction,
  createMilestoneAction,
  deleteMilestoneAction,
  reopenMilestoneAction,
  submitMilestoneAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_milestoneAction"
import { dayOf, statusOf } from "@/components/modules/Admin/Projects/milestoneStatus"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ApiResult } from "@/types/api.types"
import type { IMilestone } from "@/types/project.types"
import { milestoneFormZodSchema, type IMilestoneFormValues } from "@/zod/project.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarCheck, Plus, Trash2, Undo2 } from "lucide-react"
import { useState } from "react"
import { milestonesListQuery } from "@/queries/project.queries"
import { queryKeys } from "@/lib/queryKeys"

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

// Submit, accept, reopen and delete show their result on the row itself, so
// only a failure gets a toast.
const useMilestoneChange = (action: (id: string) => Promise<ApiResult<unknown>>) =>
  useActionMutation({
    action,
    successMessage: false,
    invalidateKeys: [queryKeys.milestones.all],
    refresh: false,
  })

const emptyMilestone: IMilestoneFormValues = { title: "", due_date: "" }

/** `canManage` is false for anybody the API refuses: the controls that change
 *  things come off rather than failing when pressed. */
const ProjectMilestonePanel = ({
  projectId,
  canManage = true,
}: {
  projectId: string
  canManage?: boolean
}) => {
  const [milestoneToDelete, setMilestoneToDelete] = useState<IMilestone | null>(null)

  const milestonesQuery = useQuery(milestonesListQuery(`project_id=${projectId}`))

  const milestones = milestonesQuery.data?.data ?? []

  const { run: addMilestone, isPending: isCreating } = useActionMutation({
    action: createMilestoneAction,
    successMessage: "Milestone added",
    invalidateKeys: [queryKeys.milestones.all],
    refresh: false,
  })

  const { run: submit, isPending: isSubmitting } = useMilestoneChange(submitMilestoneAction)
  const { run: accept, isPending: isAccepting } = useMilestoneChange(acceptMilestoneAction)
  const { run: reopen, isPending: isReopening } = useMilestoneChange(reopenMilestoneAction)
  const { run: remove, isPending: isRemoving } = useMilestoneChange(deleteMilestoneAction)

  const form = useForm({
    defaultValues: emptyMilestone,
    validators: { onSubmit: milestoneFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await addMilestone({ project_id: projectId, ...value })) formApi.reset()
    },
  })

  const handleDelete = async () => {
    if (milestoneToDelete && (await remove(milestoneToDelete.id))) setMilestoneToDelete(null)
  }

  const isBusy = isSubmitting || isAccepting || isReopening || isRemoving

  const delivered = milestones.filter((milestone) => milestone.submitted_at)
  const onTime = delivered.filter((milestone) => !statusOf(milestone).late)
  // A fraction, not a percentage: "2 of 3" is honest about how few it is
  // computed from; "67%" is not.
  const deliverySummary =
    delivered.length === 0 ? "Nothing delivered yet." : `${onTime.length} of ${delivered.length} delivered on time`

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">Milestones</CardTitle>
          {milestonesQuery.isSuccess && <p className="text-sm text-muted-foreground">{deliverySummary}</p>}
        </div>
      </CardHeader>

      {canManage && (
      <form
        className="flex flex-wrap items-end gap-3 border-b px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="title">
          {(field) => (
            <div className="min-w-48 flex-1 space-y-1.5">
              <Label htmlFor="milestone-title">Milestone</Label>
              <Input
                id="milestone-title"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Design handover"
                disabled={isCreating}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="due_date">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="milestone-due">Due</Label>
              <Input
                id="milestone-due"
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                disabled={isCreating}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => milestoneFormZodSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="submit" disabled={isCreating || !isComplete}>
              <Plus className="size-4" />
              Add
            </Button>
          )}
        </form.Subscribe>
      </form>
      )}

      <PanelState
        query={milestonesQuery}
        errorMessage="The milestones did not load."
        isEmpty={milestones.length === 0}
        empty={
          <EmptyState icon={CalendarCheck}>
            No milestones yet. Without a dated promise there is nothing to be on time for.
          </EmptyState>
        }
      >
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

                  {/* Offered to everybody: delivering is the operations role's
                      job, and the API lets anyone on the project submit. */}
                  {!milestone.submitted_at && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void submit(milestone.id)}
                    >
                      Submit
                    </Button>
                  )}

                  {canManage && milestone.submitted_at && !milestone.accepted_at && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void accept(milestone.id)}
                    >
                      Accept
                    </Button>
                  )}

                  {canManage && milestone.submitted_at && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => void reopen(milestone.id)}
                      title="Undo the submission so it can be corrected"
                    >
                      <Undo2 className="size-3.5" />
                      <span className="sr-only">Reopen {milestone.title}</span>
                    </Button>
                  )}

                  {canManage && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => setMilestoneToDelete(milestone)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete {milestone.title}</span>
                  </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </PanelState>

      <ConfirmDialog
        open={milestoneToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setMilestoneToDelete(null)
        }}
        title="Delete this milestone?"
        description={
          <>
            <span className="font-medium text-foreground">{milestoneToDelete?.title}</span> and its
            delivery record go for good. A missed milestone deleted here also stops counting against
            the on-time rate.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isRemoving}
        onConfirm={() => void handleDelete()}
      />
    </Card>
  )
}

export default ProjectMilestonePanel
