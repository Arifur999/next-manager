import { buildQueryString } from "@/lib/queryString"
import type { SearchParamsRecord } from "@/lib/table/urlState"
import { sentenceCase } from "@/lib/text"

/**
 * Which tasks a URL asks for. Read the same way by the page, which prefetches,
 * and by the board, which fetches, so both build the same query key and the
 * first paint is the view that was asked for.
 */
export type TaskView = {
  mine: boolean
  overdue: boolean
  // Work inside the clients the caller brought in; the API accepts only "me".
  clientOwner: boolean
  unassigned: boolean
  due: "today" | "upcoming" | null
  completed: boolean
  // A status NAME, matched case-insensitively by the API: a static link
  // cannot carry an id that differs per agency.
  status: string | null
}

type ParamsSource = URLSearchParams | SearchParamsRecord

const read = (source: ParamsSource, key: string): string | null => {
  if (source instanceof URLSearchParams) return source.get(key)
  const value = source[key]
  return typeof value === "string" ? value : null
}

export const readTaskView = (source: ParamsSource, { mineOnly = false } = {}): TaskView => {
  const due = read(source, "due")

  return {
    mine: mineOnly || read(source, "mine") === "true",
    overdue: read(source, "overdue") === "true",
    clientOwner: read(source, "client_owner") === "me",
    unassigned: read(source, "unassigned") === "true",
    due: due === "today" || due === "upcoming" ? due : null,
    completed: read(source, "completed") === "true",
    status: read(source, "status")?.trim() || null,
  }
}

export const taskQueryString = (view: TaskView): string =>
  buildQueryString({
    mine: view.mine ? "true" : undefined,
    overdue: view.overdue ? "true" : undefined,
    client_owner: view.clientOwner ? "me" : undefined,
    unassigned: view.unassigned ? "true" : undefined,
    due: view.due,
    completed: view.completed ? "true" : undefined,
    status: view.status,
  })

// A view that narrows to one slice reads as a list: a board with four late
// tasks in one column and three empty ones beside it says nothing.
export const readsAsList = (view: TaskView): boolean =>
  view.overdue || view.due !== null || view.completed || view.unassigned || view.status !== null

// Anything that narrows the board, so a new task would not land in view.
export const isNarrowed = (view: TaskView): boolean => readsAsList(view) || view.mine || view.clientOwner

// "In review" is a place ("Tasks in review"); anything else is a kind ("Blocked tasks").
export const taskViewTitle = (status: string | null): string => {
  if (!status) return "Tasks"
  const name = sentenceCase(status)
  return /^in\s/i.test(name) ? `Tasks in ${name.slice(3)}` : `${name} tasks`
}

// Names the view that is empty: "No tasks yet" on a filtered view would be a
// claim about the whole board.
export const emptyMessageFor = (view: TaskView): string => {
  if (view.overdue) return "Nothing is late."
  if (view.unassigned) return "Every task has somebody on it."
  if (view.status) return `No task is in the ${sentenceCase(view.status)} column.`
  if (view.due === "today") return "Nothing is due today."
  if (view.due === "upcoming") return "Nothing due in the next seven days."
  if (view.completed) return "Nothing finished yet."
  if (view.mine) return "Nothing assigned to you."
  if (view.clientOwner) return "No work on the clients you brought in yet."
  return "No tasks yet."
}
