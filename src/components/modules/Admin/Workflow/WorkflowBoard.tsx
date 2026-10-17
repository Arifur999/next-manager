"use client"

import {
  deleteWorkflowStatusAction,
  updateWorkflowStatusAction,
} from "@/app/(dashboardLayout)/admin/dashboard/workflow/_action"
import NewStatusForm from "@/components/modules/Admin/Workflow/NewStatusForm"
import { STATUS_CATEGORIES } from "@/components/modules/Admin/Workflow/statusCategories"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IWorkflowStatus } from "@/types/work.types"
import type { IWorkflowStatusChange } from "@/zod/work.validation"
import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Columns3, Power, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { workflowStatusesListQuery } from "@/queries/work.queries"
import { queryKeys } from "@/lib/queryKeys"

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

const WorkflowBoard = ({ kind }: { kind: "task" | "project" }) => {
  const [statusToDelete, setStatusToDelete] = useState<IWorkflowStatus | null>(null)

  const statusesQuery = useQuery(workflowStatusesListQuery(`kind=${kind}`))

  const statuses = statusesQuery.data?.data ?? []

  // A move, a new default or a column switched off shows on the board itself.
  const { run: change, isPending: isChanging } = useActionMutation({
    action: ({ id, payload }: { id: string; payload: IWorkflowStatusChange }) =>
      updateWorkflowStatusAction(id, payload),
    successMessage: false,
    invalidateKeys: [queryKeys.workflowStatuses.all],
    refresh: false,
  })

  // A move swaps the positions shown on screen, so a second one before the
  // board has refetched would swap stale positions and can leave two columns
  // sharing a slot.
  const isReordering = isChanging || statusesQuery.isFetching

  const { run: remove, isPending: isRemoving } = useActionMutation({
    action: deleteWorkflowStatusAction,
    successMessage: "Removed from the board",
    invalidateKeys: [queryKeys.workflowStatuses.all],
    refresh: false,
  })

  const handleDelete = async () => {
    if (statusToDelete && (await remove(statusToDelete.id))) setStatusToDelete(null)
  }

  // Swapping two sort_orders rather than renumbering the board: fewer writes,
  // and the rest of the columns keep the positions somebody chose.
  const move = (index: number, direction: -1 | 1) => {
    const current = statuses[index]
    const neighbour = statuses[index + direction]
    if (!current || !neighbour) return

    void change({ id: current.id, payload: { sort_order: neighbour.sort_order } })
    void change({ id: neighbour.id, payload: { sort_order: current.sort_order } })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <NewStatusForm kind={kind} />

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">
            {kind === "task" ? "Task board" : "Project board"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Left to right, in the order work moves through them.
          </p>
        </CardHeader>

        <PanelState
          query={statusesQuery}
          errorMessage="The columns did not load."
          isEmpty={statuses.length === 0}
          empty={
            <EmptyState icon={Columns3} hint="Add the first one with the form beside this list.">
              No columns on this board yet.
            </EmptyState>
          }
        >
          <ul className="divide-y">
            {statuses.map((status, index) => {
              const inUse = (status._count?.tasks ?? 0) + (status._count?.projects ?? 0)
              const meaning = STATUS_CATEGORIES.find((option) => option.value === status.category)

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
                      disabled={index === 0 || isReordering}
                      onClick={() => move(index, -1)}
                      aria-label={`Move ${status.name} earlier`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === statuses.length - 1 || isReordering}
                      onClick={() => move(index, 1)}
                      aria-label={`Move ${status.name} later`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>

                    {!status.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void change({ id: status.id, payload: { is_default: true } })}
                      >
                        Start here
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        void change({ id: status.id, payload: { is_active: !status.is_active } })
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
                      onClick={() => setStatusToDelete(status)}
                      aria-label={`Delete ${status.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </PanelState>

        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Turning a column off keeps the work that is already on it and stops anything new
          going there. Deleting one is refused while anything is on it.
        </div>
      </Card>

      <ConfirmDialog
        open={statusToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setStatusToDelete(null)
        }}
        title="Delete this column?"
        description={
          <>
            <span className="font-medium text-foreground">{statusToDelete?.name}</span> comes off the
            board for good. A column with work on it cannot be deleted; turning it off keeps that work
            and stops anything new going there.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isRemoving}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}

export default WorkflowBoard
