import { differenceInCalendarDays, parseISO } from "date-fns"

/**
 * Quiet for a month, or never used at all.
 *
 * Silence is the earliest churn signal there is — it arrives weeks before a
 * cancellation does — so a company quiet for a month is marked rather than
 * left for somebody to notice by reading dates.
 */
export const isQuietSince = (iso: string | null) => !iso || differenceInCalendarDays(new Date(), parseISO(iso)) >= 30
