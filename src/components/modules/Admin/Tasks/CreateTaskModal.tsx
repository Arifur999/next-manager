"use client"

import { createTaskAction } from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { getProjects, getWorkflowStatuses } from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IProject, IWorkflowStatus } from "@/types/agencio.types"
import type { IUser } from "@/types/user.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const taskFormSchema = z.object({
  project_id: z.string().min(1, "Choose a project"),
  title: z.string().min(1, "Title is required"),
  assignee_id: z.string().optional(),
  // An id, not a word: the columns belong to the agency now.
  status_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

const CreateTaskModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: projectsData } = useQuery({
    queryKey: ["projects", ""],
    queryFn: () => getProjects(),
    enabled: open,
  })
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
    enabled: open,
  })

  const projects = (projectsData?.data ?? []) as IProject[]
  const users = ((usersData?.data ?? []) as IUser[]).filter((user) => user.status === "active")

  // The agency's own columns, rather than a list of words baked in here.
  const { data: statusData } = useQuery({
    queryKey: ["workflow-statuses", "task"],
    queryFn: () => getWorkflowStatuses("kind=task"),
  })
  const statuses = (statusData?.data ?? []) as IWorkflowStatus[]

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: TaskFormValues) =>
      createTaskAction({
        ...values,
        assignee_id: values.assignee_id || null,
        due_date: values.due_date || null,
      }),
  })

  const defaultValues: TaskFormValues = {
    project_id: "",
    title: "",
    assignee_id: "",
    status_id: "",
    priority: "medium",
    due_date: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // An empty string is not a missing value to the API, it is an invalid
      // id - and the form starts with one. Dropping it means "put it on the
      // board default", which is what leaving the picker alone means.
      const result = await mutateAsync({
        ...value,
        status_id: value.status_id || undefined,
      })

      if (!result.success) {
        toast.error(result.message || "Failed to create task")
        return
      }

      toast.success("Task created")
      setOpen(false)
      form.reset()

      void queryClient.invalidateQueries({ queryKey: ["tasks"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
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
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          New task
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Work on a project, optionally assigned to someone.</DialogDescription>
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
              <form.Field name="title" validators={{ onChange: taskFormSchema.shape.title }}>
                {(field) => (
                  <AppField
                    field={field}
                    label="Title"
                    placeholder="e.g. Ship the pricing page"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <form.Field
                name="project_id"
                validators={{ onChange: taskFormSchema.shape.project_id }}
              >
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Project"
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                    emptyMessage="Create a project first"
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

              <form.Field name="assignee_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Assignee (optional)"
                    value={field.state.value ?? ""}
                    onChange={field.handleChange}
                    disabled={isPending}
                    placeholder="Unassigned"
                    emptyMessage="No team members yet"
                    options={users.map((user) => ({ value: user.id, label: user.full_name }))}
                  />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="status_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Status"
                    value={field.state.value ?? ""}
                    onChange={(value) => field.handleChange(value)}
                    disabled={isPending}
                    // Only the columns that are switched on. A retired one is
                    // somewhere work can sit, not somewhere it can be put.
                    options={statuses
                      .filter((status) => status.is_active)
                      .map((status) => ({ value: status.id, label: status.name }))}
                  />
                )}
              </form.Field>

              <form.Field name="priority">
                  {(field) => (
                    <EntitySelect
                      id={field.name}
                      label="Priority"
                      value={field.state.value}
                      onChange={(value) =>
                        field.handleChange(value as TaskFormValues["priority"])
                      }
                      disabled={isPending}
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "urgent", label: "Urgent" },
                      ]}
                    />
                  )}
                </form.Field>

                <form.Field name="due_date">
                  {(field) => (
                    <AppField field={field} label="Due date" type="date" disabled={isPending} />
                  )}
                </form.Field>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Creating..." className="w-auto">
                  Create task
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskModal
