import { parseISO } from "date-fns"

// The API sends calendar days as "2026-09-01". new Date() reads that as
// midnight UTC, which is the previous evening west of Greenwich; parseISO
// reads it as a local day, so the day shown is the day stored everywhere.
// Full timestamps parse to the same instant either way.
export const toDate = (value: string | Date): Date => (typeof value === "string" ? parseISO(value) : value)
