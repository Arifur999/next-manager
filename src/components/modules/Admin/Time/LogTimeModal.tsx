"use client"

import { logTimeAction } from "@/app/(dashboardLayout)/dashboard/timesheet/_action"
import TaskPicker from "@/components/modules/Admin/Time/TaskPicker"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useActionMutation } from "@/hooks/useActionMutation"
import { logTimeFormZodSchema, type ILogTimeFormValues } from "@/zod/work.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { projectsListQuery } from "@/queries/project.queries"
import { queryKeys } from "@/lib/queryKeys"

const LogTimeModal = ({ defaultDate }: { defaultDate: string }) => {
  const [open, setOpen] = useState(false)

  const { data: projectsData } = useQuery({ ...projectsListQuery(), enabled: open })

  const projects = projectsData?.data ?? []

  const { run: logTime, isPending } = useActionMutation({
    action: logTimeAction,
    successMessage: "Time logged",
    invalidateKeys: [queryKeys.timeEntries.all, queryKeys.timeSummary.all],
    refresh: false,
  })

  const defaultValues: ILogTimeFormValues = {
    project_id: "",
    task_id: "",
    date: defaultDate,
    hours: "",
    // Defaulted here rather than on the API. The server requires the field
    // explicitly, so a client that forgets it is refused rather than silently
    // inflating the billable share.
    is_billable: true,
    notes: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (await logTime(value)) {
        setOpen(false)
        form.reset()
      }
    },
  })

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) form.reset()
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          Log time
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Log time</DialogTitle>
          <DialogDescription>
            Log the non-billable hours too — without them the utilization figure is measured
            against a number nobody wrote down.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
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
                    error={
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? "Choose a project"
                        : null
                    }
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
                    <AppField
                      field={field}
                      label="Hours"
                      type="number"
                      placeholder="e.g. 6.5"
                      disabled={isPending}
                    />
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
                  <AppField
                    field={field}
                    label="Notes"
                    placeholder="What you worked on"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Logging..." className="w-auto">
                  Log time
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default LogTimeModal
