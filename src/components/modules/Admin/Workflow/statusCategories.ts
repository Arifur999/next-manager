import type { StatusCategory } from "@/types/common.types"

// What a column can mean, in the words the board shows for each meaning.
export const STATUS_CATEGORIES: Array<{ value: StatusCategory; label: string; blurb: string }> = [
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
