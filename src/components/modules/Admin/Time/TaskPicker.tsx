"use client"

import EntitySelect from "@/components/shared/form/EntitySelect"
import { useQuery } from "@tanstack/react-query"
import { tasksListQuery } from "@/queries/work.queries"

/**
 * Tasks for the chosen project only.
 *
 * Controlled rather than reaching into the form, and declared at module scope:
 * a component created during render is remounted on every parent re-render,
 * which here would drop the open dropdown mid-selection.
 */
const TaskPicker = ({
  projectId,
  value,
  onChange,
  disabled,
}: {
  projectId: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
}) => {
  const { data } = useQuery({ ...tasksListQuery(`project_id=${projectId}`), enabled: Boolean(projectId) })

  const tasks = data?.data ?? []

  return (
    <EntitySelect
      id="task_id"
      label="Task (optional)"
      value={value}
      onChange={onChange}
      disabled={disabled || !projectId}
      placeholder={projectId ? "Not tied to a task" : "Choose a project first"}
      emptyMessage="No tasks on this project"
      options={tasks.map((task) => ({ value: task.id, label: task.title }))}
    />
  )
}

export default TaskPicker
