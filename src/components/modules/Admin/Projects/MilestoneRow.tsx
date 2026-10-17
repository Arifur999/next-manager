import { dayOf, statusOf } from "@/components/modules/Admin/Projects/milestoneStatus"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { IMilestone } from "@/types/project.types"
import { format } from "date-fns"
import { Trash2, Undo2 } from "lucide-react"

type MilestoneRowProps = {
  milestone: IMilestone
  canManage: boolean
  isBusy: boolean
  onSubmit: (id: string) => void
  onAccept: (id: string) => void
  onReopen: (id: string) => void
  onDelete: (milestone: IMilestone) => void
}

const MilestoneRow = ({ milestone, canManage, isBusy, onSubmit, onAccept, onReopen, onDelete }: MilestoneRowProps) => {
  const state = statusOf(milestone)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{milestone.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          Due {format(dayOf(milestone.due_date), "dd MMM yyyy")}
          {milestone.submitted_at ? ` · submitted ${format(dayOf(milestone.submitted_at), "dd MMM")}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={state.tone} className="text-xs">
          {state.label}
        </Badge>

        {/* Offered to everybody: delivering is the operations role's job, and
            the API lets anyone on the project submit. */}
        {!milestone.submitted_at && (
          <Button type="button" size="sm" disabled={isBusy} onClick={() => onSubmit(milestone.id)}>
            Submit
          </Button>
        )}

        {canManage && milestone.submitted_at && !milestone.accepted_at && (
          <Button type="button" size="sm" disabled={isBusy} onClick={() => onAccept(milestone.id)}>
            Accept
          </Button>
        )}

        {canManage && milestone.submitted_at && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={() => onReopen(milestone.id)}
            title="Undo the submission so it can be corrected"
          >
            <Undo2 className="size-3.5" />
            <span className="sr-only">Reopen {milestone.title}</span>
          </Button>
        )}

        {canManage && (
          <Button type="button" size="sm" variant="outline" disabled={isBusy} onClick={() => onDelete(milestone)}>
            <Trash2 className="size-3.5" />
            <span className="sr-only">Delete {milestone.title}</span>
          </Button>
        )}
      </div>
    </li>
  )
}

export default MilestoneRow
