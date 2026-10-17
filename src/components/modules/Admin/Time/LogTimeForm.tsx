"use client"

import { logTimeAction, updateTimeAction } from "@/app/(dashboardLayout)/dashboard/timesheet/_action"
import TaskPicker from "@/components/modules/Admin/Time/TaskPicker"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { projectsListQuery } from "@/queries/project.queries"
import type { ITimeEntry } from "@/types/work.types"
import { logTimeFormZodSchema, type ILogTimeFormValues } from "@/zod/work.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"

const valuesOf = (entry: ITimeEntry): ILogTimeFormValues => ({
  project_id: entry.project_id,
  task_id: entry.task_id ?? "",
  date: entry.date,
  hours: String(entry.hours),
  is_billable: entry.is_billable,
  notes: entry.notes,
})

const emptyValues = (date: string): ILogTimeFormValues => ({
  project_id: "",
  task_id: "",
  date,
  hours: "",
  // Defaulted here rather than on the API. The server requires the field
  // explicitly, so a client that forgets it is refused rather than silently
  // inflating the billable share.
  is_billable: true,
  notes: "",
})

type LogTimeFormProps = {
  /** Absent to log new time; present to change an entry that is not yet approved. */
  entry?: ITimeEntry | null
  defaultDate: string
  onDone: () => void
}

const LogTimeForm = ({ entry, defaultDate, onDone }: LogTimeFormProps) => {
  const { data: projectsData } = useQuery(projectsListQuery())
  const projects = projectsData?.data ?? []

  const { run: saveTime, isPending } = useActionMutation({
    action: (values: ILogTimeFormValues) => (entry ? updateTimeAction(entry.id, values) : logTimeAction(values)),
    successMessage: entry ? "Time saved" : "Time logged",
    invalidateKeys: [queryKeys.timeEntries.all, queryKeys.timeSummary.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: entry ? valuesOf(entry) : emptyValues(defaultDate),
    onSubmit: async ({ value }) => {
      if (await saveTime(value)) onDone()
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
      <form.Field name="project_id" validators={{ onChange: logTimeFormZodSchema.shape.project_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Project"
            value={field.state.value}
            onChange={(value) => {
              field.handleChange(value)
              // A task from another project is refused by the server,
              // so switching project clears the stale choice rather
              // than letting it be submitted.
              form.setFieldValue("task_id", "")
            }}
            disabled={isPending}
            emptyMessage="No projects yet"
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
              hint: project.code,
            }))}
            error={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? "Choose a project" : null}
          />
        )}
      </form.Field>

      <form.Field name="task_id">
        {(field) => (
          <form.Subscribe selector={(state) => state.values.project_id}>
            {(projectId) => (
              <TaskPicker
                projectId={projectId}
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                disabled={isPending}
              />
            )}
          </form.Subscribe>
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="date">
          {(field) => <AppField field={field} label="Date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="hours" validators={{ onChange: logTimeFormZodSchema.shape.hours }}>
          {(field) => (
            <AppField field={field} label="Hours" type="number" placeholder="e.g. 6.5" disabled={isPending} />
          )}
        </form.Field>
      </div>

      <form.Field name="is_billable">
        {(field) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor={field.name} className="font-normal">
              Billable — this time can be charged to the client
            </Label>
          </div>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <AppField field={field} label="Notes" placeholder="What you worked on" disabled={isPending} />
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton isPending={isPending} pendingLabel={entry ? "Saving..." : "Logging..."} className="w-auto">
          {entry ? "Save changes" : "Log time"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

export default LogTimeForm
