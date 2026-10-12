import type { StatusCategory } from "@/types/common.types"

/**
 * How a status looks, decided by what it MEANS rather than what it is called.
 *
 * An agency that renames "Done" to "Shipped" keeps the same treatment, and one
 * that adds "In QA" gets the in-progress treatment without anybody adding it
 * to a lookup table. That is the whole reason a status carries a category.
 *
 * These are states, not chart series, so every one takes a status pair whose
 * text passes 4.5:1 on its tint (npm run qa:contrast checks the pairs).
 */
export const STATUS_TONE: Record<StatusCategory, string> = {
    open: "bg-muted text-muted-foreground",
    active: "bg-info-subtle text-info-subtle-foreground",
    blocked: "bg-warning-subtle text-warning-subtle-foreground",
    done: "bg-success-subtle text-success-subtle-foreground",
    cancelled: "bg-destructive-subtle text-destructive-subtle-foreground",
}
