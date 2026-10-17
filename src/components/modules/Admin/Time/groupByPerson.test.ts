import type { ITimeEntry } from "@/types/work.types"
import { describe, expect, it } from "vitest"
import { groupByPerson } from "./groupByPerson"

const entry = (id: string, userId: string, name: string | null, hours: number): ITimeEntry => ({
  id,
  user_id: userId,
  project_id: "p1",
  task_id: null,
  date: "2026-10-12",
  hours,
  is_billable: true,
  notes: "",
  approved_at: null,
  approved_by: null,
  user: name ? { id: userId, full_name: name, email: `${userId}@agency.test` } : undefined,
})

describe("groupByPerson", () => {
  it("puts each person's entries together and totals their hours", () => {
    const groups = groupByPerson([entry("e1", "u1", "Rina", 3), entry("e2", "u2", "Tanvir", 2), entry("e3", "u1", "Rina", 4.5)])

    expect(groups.map((group) => [group.name, group.hours, group.entries.length])).toEqual([
      ["Rina", 7.5, 2],
      ["Tanvir", 2, 1],
    ])
  })

  it("lists the biggest week first", () => {
    const groups = groupByPerson([entry("e1", "u1", "Rina", 2), entry("e2", "u2", "Tanvir", 9)])
    expect(groups.map((group) => group.userId)).toEqual(["u2", "u1"])
  })

  it("groups an entry without its user by user_id and names it Unknown", () => {
    const [group] = groupByPerson([entry("e1", "u9", null, 1)])
    expect(group).toMatchObject({ userId: "u9", name: "Unknown", hours: 1 })
  })
})
