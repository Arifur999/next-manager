// The open task lives in the URL (?task=<id>), so a task can be linked to,
// reloaded and closed with Back like any other view.
export const TASK_PARAM = "task"

/** The same page and view, with the sheet open on this task, or closed for null. */
export const withOpenTask = (pathname: string, search: string, taskId: string | null): string => {
  const params = new URLSearchParams(search)
  if (taskId) params.set(TASK_PARAM, taskId)
  else params.delete(TASK_PARAM)

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

// pushState rather than router.push: no server round trip and no scroll jump,
// and Next keeps useSearchParams in step. Opening adds a history entry so Back
// closes the sheet; closing replaces it so Forward does not reopen it.
export const openTaskSheet = (taskId: string) =>
  window.history.pushState(null, "", withOpenTask(window.location.pathname, window.location.search, taskId))

export const closeTaskSheet = () =>
  window.history.replaceState(null, "", withOpenTask(window.location.pathname, window.location.search, null))
