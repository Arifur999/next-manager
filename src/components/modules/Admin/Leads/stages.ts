import type { LeadStage } from "@/types/agencio.types"

/**
 * The stages a lead moves through, in one place.
 *
 * These were declared identically in three files after the pipeline was split
 * apart — which is exactly how a stage gets added to the board and forgotten in
 * the picker, so the two disagree about what a lead can be.
 *
 * `OPEN_STAGES` is the board: only deals still in play get a column, because
 * won and lost ones would grow forever and push the live work off the screen.
 * `ALL_STAGES` is every stage a lead can be moved to, which includes the two
 * that end it.
 */

export const OPEN_STAGES: Array<{ stage: LeadStage; label: string }> = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "proposal", label: "Proposal" },
  { stage: "negotiating", label: "Negotiating" },
]

export const ALL_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "proposal",
  "negotiating",
  "won",
  "lost",
]
