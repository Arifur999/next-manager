import { sentenceCase } from "@/lib/text"
import type { LeadStage } from "@/types/crm.types"

// The board's columns. Only deals still in play get one: won and lost ones
// would grow forever and push the live work off the screen. Every stage a lead
// can be moved to is LEAD_STAGES in crm.types.
export const OPEN_STAGES: Array<{ stage: LeadStage; label: string }> = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "proposal", label: "Proposal" },
  { stage: "negotiating", label: "Negotiating" },
]

// One line of a lead's history. The first event has no from_stage: it is the
// stage the lead was added in.
export const describeStageEvent = (event: { from_stage: string | null; to_stage: string }): string => {
  if (!event.from_stage) return `Added in ${sentenceCase(event.to_stage)}`
  return `Moved from ${sentenceCase(event.from_stage)} to ${sentenceCase(event.to_stage)}`
}
