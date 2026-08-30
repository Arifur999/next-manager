import type { StatusCategory } from "@/types/agencio.types"

/**
 * How a status looks, decided by what it MEANS rather than what it is called.
 *
 * An agency that renames "Done" to "Shipped" keeps the same treatment, and one
 * that adds "In QA" gets the in-progress treatment without anybody adding it
 * to a lookup table. That is the whole reason a status carries a category.
 *
 * `blocked` and `cancelled` are STATES, not series, so they take the status
 * palette rather than another categorical hue.
 */
export const STATUS_TONE: Record<StatusCategory, string> = {
    open: "bg-muted text-muted-foreground",
    active: "bg-chart-1/15 text-chart-1",
    blocked: "bg-chart-4/15 text-chart-4",
    done: "bg-chart-3/15 text-chart-3",
    cancelled: "bg-destructive/12 text-destructive",
}
