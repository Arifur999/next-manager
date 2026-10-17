import type { ITimeEntry } from "@/types/work.types"

export type PersonWeek = {
  userId: string
  name: string
  entries: ITimeEntry[]
  hours: number
}

export const groupByPerson = (entries: ITimeEntry[]): PersonWeek[] => {
  const groups = new Map<string, PersonWeek>()

  for (const entry of entries) {
    const userId = entry.user?.id ?? entry.user_id
    const existing = groups.get(userId)

    if (existing) {
      existing.entries.push(entry)
      existing.hours += entry.hours
      continue
    }

    groups.set(userId, {
      userId,
      name: entry.user?.full_name ?? "Unknown",
      entries: [entry],
      hours: entry.hours,
    })
  }

  // Biggest week first: the person with 46 logged hours is the one worth
  // looking at before the person with 4.
  return [...groups.values()].sort((a, b) => b.hours - a.hours)
}
