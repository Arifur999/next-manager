import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/types/work.types"

// Status pairs rather than chart colours: the chart tints failed 4.5:1 at this
// size (High 3.13:1, Medium 4.05:1). npm run qa:contrast checks these pairs.
const PRIORITY_TONE: Record<TaskPriority, string> = {
  urgent: "bg-destructive-subtle text-destructive-subtle-foreground",
  high: "bg-warning-subtle text-warning-subtle-foreground",
  medium: "bg-info-subtle text-info-subtle-foreground",
  low: "bg-muted text-muted-foreground",
}

const TaskPriorityBadge = ({ priority, className }: { priority: TaskPriority; className?: string }) => (
  <span
    className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium capitalize", PRIORITY_TONE[priority], className)}
  >
    {priority}
  </span>
)

export default TaskPriorityBadge
