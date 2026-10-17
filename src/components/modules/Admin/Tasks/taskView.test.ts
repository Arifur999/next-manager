import { describe, expect, it } from "vitest"
import { emptyMessageFor, isNarrowed, readsAsList, readTaskView, taskQueryString, taskViewTitle } from "./taskView"

describe("readTaskView", () => {
  it("reads the browser's params and a page's searchParams the same way", () => {
    const fromBrowser = readTaskView(new URLSearchParams("status=In%20review&unassigned=true"))
    const fromPage = readTaskView({ status: "In review", unassigned: "true" })

    expect(fromBrowser).toEqual(fromPage)
    expect(fromPage.status).toBe("In review")
    expect(fromPage.unassigned).toBe(true)
  })

  it("ignores values the API would refuse", () => {
    const view = readTaskView({ due: "yesterday", client_owner: "someone-else", status: "  ", mine: ["true", "x"] })

    expect(view.due).toBeNull()
    expect(view.clientOwner).toBe(false)
    expect(view.status).toBeNull()
    expect(view.mine).toBe(false)
  })

  it("is always the caller's own on the personal page", () => {
    expect(readTaskView({}, { mineOnly: true }).mine).toBe(true)
  })
})

describe("taskQueryString", () => {
  it("forwards the status and unassigned filters the board used to drop", () => {
    expect(taskQueryString(readTaskView({ status: "In review" }))).toBe("status=In+review")
    expect(taskQueryString(readTaskView({ unassigned: "true" }))).toBe("unassigned=true")
  })

  it("keeps the key the dashboard tiles already share", () => {
    expect(taskQueryString(readTaskView({ due: "today" }, { mineOnly: true }))).toBe("mine=true&due=today")
    expect(taskQueryString(readTaskView({}))).toBe("")
  })
})

describe("readsAsList and isNarrowed", () => {
  it("lists a single slice and keeps the whole board as a board", () => {
    expect(readsAsList(readTaskView({ status: "In review" }))).toBe(true)
    expect(readsAsList(readTaskView({ unassigned: "true" }))).toBe(true)
    expect(readsAsList(readTaskView({ mine: "true" }))).toBe(false)
    expect(isNarrowed(readTaskView({ mine: "true" }))).toBe(true)
    expect(isNarrowed(readTaskView({}))).toBe(false)
  })
})

describe("taskViewTitle", () => {
  it("names the status view", () => {
    expect(taskViewTitle(null)).toBe("Tasks")
    expect(taskViewTitle("In review")).toBe("Tasks in review")
    expect(taskViewTitle("in review")).toBe("Tasks in review")
    expect(taskViewTitle("In QA")).toBe("Tasks in QA")
    expect(taskViewTitle("Blocked")).toBe("Blocked tasks")
  })
})

describe("emptyMessageFor", () => {
  it("names the view that is empty", () => {
    expect(emptyMessageFor(readTaskView({ unassigned: "true" }))).toBe("Every task has somebody on it.")
    expect(emptyMessageFor(readTaskView({ status: "In review" }))).toBe("No task is in the In review column.")
    expect(emptyMessageFor(readTaskView({}))).toBe("No tasks yet.")
  })
})
