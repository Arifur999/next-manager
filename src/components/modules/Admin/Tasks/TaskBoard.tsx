"use client"

import {
  createTaskAction,
  updateTaskAction,
} from "@/app/(dashboardLayout)/admin/dashboard/tasks/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { getProjects, getTasks } from "@/services/agencio.services"
import { getAllUsers } from "@/services/user.services"
import type { IProject, ITask, TaskStatus } from "@/types/agencio.types"
import type { IUser } from "@/types/user.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, isBefore, startOfToday } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ListChecks, Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const taskFormSchema = z.object({
  project_id: z.string().min(1, "Choose a project"),
  title: z.string().min(1, "Title is required"),
  assignee_id: z.string().optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  due_date: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

// The four states in the order work moves through them, so the columns read
// left to right the way the work does.
const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "in_review", label: "In review" },
  { status: "done", label: "Done" },
]

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-destructive/12 text-destructive",
  high: "bg-chart-2/15 text-chart-2",
  medium: "bg-chart-3/15 text-chart-3",
  low: "bg-muted text-muted-foreground",
}

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
    status: "todo",
    priority: "medium",
    due_date: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

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

const TaskCard = ({ task }: { task: ITask }) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (status: TaskStatus) => updateTaskAction(task.id, { status }),
  })

  const overdue =
    task.due_date && task.status !== "done"
      ? isBefore(new Date(task.due_date), startOfToday())
      : false

  const toggleDone = async () => {
    const next: TaskStatus = task.status === "done" ? "todo" : "done"
    const result = await mutateAsync(next)

    if (!result.success) {
      toast.error(result.message || "Failed to update task")
      return
    }

    void queryClient.invalidateQueries({ queryKey: ["tasks"] })
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => void toggleDone()}
          disabled={isPending}
          aria-label={task.status === "done" ? `Reopen ${task.title}` : `Mark ${task.title} done`}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm ${
              task.status === "done" ? "text-muted-foreground line-through" : "font-medium"
            }`}
          >
            {task.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {task.project?.code ?? "No project"}
            {task.assignee ? ` · ${task.assignee.full_name}` : " · unassigned"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium capitalize ${
                PRIORITY_TONE[task.priority]
              }`}
            >
              {task.priority}
            </span>
            {task.due_date && (
              <span
                className={`text-[11px] ${
                  overdue ? "font-medium text-destructive" : "text-muted-foreground"
                }`}
              >
                {overdue ? "overdue · " : "due "}
                {format(new Date(task.due_date), "MMM dd")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Tasks, in four views over one query.
 *
 * Board, List, Overdue and My Tasks are sidebar entries pointing at this same
 * component with a different URL. Four pages would be four places to fix the
 * same bug, and the sidebar looks identical either way.
 *
 * Overdue is filtered on the SERVER, not here: the list is paginated, so
 * filtering whatever page arrived would hide late work rather than find it.
 */
const TaskBoard = ({ mineOnly = false }: { mineOnly?: boolean }) => {
  const searchParams = useSearchParams()

  const mine = mineOnly || searchParams.get("mine") === "true"
  const overdue = searchParams.get("overdue") === "true"
  const asList = searchParams.get("view") === "list" || overdue

  const query = [mine ? "mine=true" : "", overdue ? "overdue=true" : ""]
    .filter(Boolean)
    .join("&")

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", query],
    queryFn: () => getTasks(query || undefined),
  })

  const tasks = (data?.data ?? []) as ITask[]

  const empty = overdue
    ? "Nothing is late."
    : mine
      ? "Nothing assigned to you."
      : "No tasks yet."

  return (
    <div className="space-y-4">
      {!mine && !overdue && (
        <div className="flex justify-end">
          <CreateTaskModal />
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => (
            <Card key={column.status} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <ListChecks className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">{empty}</p>
        </Card>
      ) : asList ? (
        // One flat list, newest deadline first. A board is for seeing where
        // work is stuck; a list is for working through it, and a column of
        // four late tasks beside three empty columns says nothing.
        <Card className="gap-0 overflow-hidden p-0">
          <ul className="divide-y">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.project?.name ?? "No project"}
                    {task.assignee ? ` · ${task.assignee.full_name}` : " · unassigned"}
                  </p>
                </div>

                <Badge variant="outline" className="capitalize">
                  {task.status.replace(/_/g, " ")}
                </Badge>

                {task.due_date && (
                  <span
                    className={
                      isBefore(new Date(task.due_date), startOfToday()) && task.status !== "done"
                        ? "text-sm font-medium"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {format(new Date(task.due_date), "d MMM")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status)

            return (
              <Card key={column.status} className="gap-0 overflow-hidden p-0">
                <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                  <CardTitle className="text-sm">{column.label}</CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {columnTasks.length}
                  </span>
                </CardHeader>

                <div className="space-y-2 p-3">
                  {columnTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : (
                    columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaskBoard
