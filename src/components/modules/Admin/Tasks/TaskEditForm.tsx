"use client"

import { updateOwnTaskAction, updateTaskAction } from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import TaskFacts from "@/components/modules/Admin/Tasks/TaskFacts"
import { statusChoices } from "@/components/modules/Admin/Tasks/statusChoices"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { usersListQuery } from "@/queries/people.queries"
import { workflowStatusesListQuery } from "@/queries/work.queries"
import type { ITask } from "@/types/work.types"
import { taskEditFormZodSchema, type ITaskEditFormValues } from "@/zod/work.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

// A select cannot hold an empty value, so "nobody" needs a word of its own.
// It never leaves this form: it is turned back into "" before the form stores it.
const NOBODY = "nobody"

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const

const valuesOf = (task: ITask): ITaskEditFormValues => ({
  title: task.title,
  status_id: task.status.id,
  assignee_id: task.assignee_id ?? "",
  priority: task.priority,
  due_date: task.due_date ?? "",
  description: task.description,
})

type TaskEditFormProps = {
  task: ITask
  /** "all" for admin and the project manager; "own" is operations on a task of theirs. */
  scope: "all" | "own"
  onSaved: () => void
  /** Shown at the start of the button row: Delete, for those who may. */
  secondaryAction?: ReactNode
}

const TaskEditForm = ({ task, scope, onSaved, secondaryAction }: TaskEditFormProps) => {
  const canChangeEverything = scope === "all"

  const { data: statusData } = useQuery(workflowStatusesListQuery("kind=task"))
  const { data: usersData } = useQuery({ ...usersListQuery(), enabled: canChangeEverything })

  const statusOptions = statusChoices(statusData?.data ?? [], task.status.id).map((status) => ({
    value: status.id,
    label: status.is_active ? status.name : `${status.name} (off)`,
  }))

  // Active people, plus whoever holds it now even if they have since left, so
  // the picker shows the current assignee rather than a blank.
  const people = (usersData?.data ?? []).filter((user) => user.status === "active" || user.id === task.assignee_id)
  const assigneeOptions = [
    { value: NOBODY, label: "Nobody yet" },
    ...people.map((user) => ({ value: user.id, label: user.full_name })),
  ]

  const { run: saveTask, isPending } = useActionMutation({
    action: (values: ITaskEditFormValues) =>
      canChangeEverything ? updateTaskAction(task.id, values) : updateOwnTaskAction(task.id, values),
    successMessage: "Task saved",
    invalidateKeys: [queryKeys.tasks.all, queryKeys.taskReport.all, queryKeys.dashboard.all],
    refresh: false,
    onSuccess: onSaved,
  })

  const form = useForm({
    defaultValues: valuesOf(task),
    onSubmit: async ({ value }) => {
      await saveTask(value)
    },
  })

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      {canChangeEverything ? (
        <form.Field name="title" validators={{ onChange: taskEditFormZodSchema.shape.title }}>
          {(field) => <AppField field={field} label="Title" disabled={isPending} />}
        </form.Field>
      ) : (
        // What operations is measured against stays in view, as text.
        <TaskFacts task={task} />
      )}

      <form.Field name="status_id" validators={{ onChange: taskEditFormZodSchema.shape.status_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Status"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            options={statusOptions}
          />
        )}
      </form.Field>

      {canChangeEverything && (
        <>
          <form.Field name="assignee_id">
            {(field) => (
              <EntitySelect
                id={field.name}
                label="Assignee"
                value={field.state.value || NOBODY}
                onChange={(value) => field.handleChange(value === NOBODY ? "" : value)}
                disabled={isPending}
                options={assigneeOptions}
              />
            )}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="priority">
              {(field) => (
                <EntitySelect
                  id={field.name}
                  label="Priority"
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={isPending}
                  options={PRIORITY_OPTIONS}
                />
              )}
            </form.Field>

            <form.Field name="due_date" validators={{ onChange: taskEditFormZodSchema.shape.due_date }}>
              {(field) => <AppField field={field} label="Due date" type="date" disabled={isPending} />}
            </form.Field>
          </div>
        </>
      )}

      <form.Field name="description">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              rows={5}
              placeholder="What done looks like, links, anything the next person needs"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <div>{secondaryAction}</div>
        <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
          Save changes
        </AppSubmitButton>
      </div>
    </form>
  )
}

export default TaskEditForm
