import { describe, expect, it } from "vitest"
import type { IProject } from "@/types/project.types"
import { projectsColumns, projectsColumnsFor } from "./projectsColumns"

const project = (contract_value_usd?: number): IProject => ({
  id: "p1",
  client_id: "c1",
  name: "Pricing page",
  code: "PRC-1",
  description: "",
  status: { id: "s1", name: "Active", category: "active", sort_order: 1 },
  start_date: null,
  end_date: null,
  contract_value_usd,
  notes: "",
})

const columnIds = (projects: IProject[]) => projectsColumnsFor(projects).map((column) => column.id)

describe("projectsColumnsFor", () => {
  it("shows the contract value when the API sent it", () => {
    expect(columnIds([project(4800)])).toContain("contract_value_usd")
    expect(projectsColumnsFor([project(0)])).toBe(projectsColumns)
  })

  it("leaves the column out when the API withheld it (operations)", () => {
    expect(columnIds([project(), project()])).not.toContain("contract_value_usd")
    expect(columnIds([project()])).toEqual(["name", "client", "status", "tasks"])
  })
})
