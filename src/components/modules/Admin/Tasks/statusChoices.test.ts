import { describe, expect, it } from "vitest"
import type { IWorkflowStatus } from "@/types/work.types"
import { statusChoices } from "./statusChoices"

const column = (id: string, is_active: boolean): IWorkflowStatus => ({
  id,
  kind: "task",
  name: id,
  category: "open",
  sort_order: 0,
  is_default: false,
  is_active,
})

describe("statusChoices", () => {
  const board = [column("todo", true), column("retired", false), column("done", true)]

  it("offers only the columns that are switched on", () => {
    expect(statusChoices(board, "todo").map((status) => status.id)).toEqual(["todo", "done"])
  })

  it("keeps a retired column a task already sits in", () => {
    expect(statusChoices(board, "retired").map((status) => status.id)).toEqual(["todo", "retired", "done"])
  })
})
