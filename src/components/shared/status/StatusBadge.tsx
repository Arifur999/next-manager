import { STATUS_TONE } from "@/components/shared/status/statusTone"
import { sentenceCase } from "@/lib/text"
import { cn } from "@/lib/utils"
import type { StatusCategory } from "@/types/common.types"
import { Circle, CircleCheck, CircleDot, CirclePause, CircleX, type LucideIcon } from "lucide-react"

// The icon repeats what the word says, so the state survives greyscale and
// colour blindness. The tones never use the brand teal: teal means "you can
// click this", and a status is not an action.
const ICONS: Record<StatusCategory, LucideIcon> = {
  open: Circle,
  active: CircleDot,
  blocked: CirclePause,
  done: CircleCheck,
  cancelled: CircleX,
}

/**
 * A status as a pill: the agency's own name, in sentence case, styled by what
 * the status MEANS (its category), so a renamed column keeps its look.
 */
const StatusBadge = ({
  category,
  label,
  className,
}: {
  category: StatusCategory
  label: string
  className?: string
}) => {
  const Icon = ICONS[category]

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_TONE[category],
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3 shrink-0" />
      {sentenceCase(label)}
    </span>
  )
}

export default StatusBadge
