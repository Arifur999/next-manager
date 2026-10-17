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
