"use client"

import {
  createProjectAction,
  updateProjectAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_action"
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
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IProject } from "@/types/project.types"
import { projectFormZodSchema, type IProjectFormValues } from "@/zod/project.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { clientsListQuery } from "@/queries/crm.queries"
import { queryKeys } from "@/lib/queryKeys"
import { workflowStatusesListQuery } from "@/queries/work.queries"

const emptyValues: IProjectFormValues = {
  client_id: "",
  name: "",
  code: "",
  status_id: "",
  start_date: "",
  end_date: "",
  contract_value_usd: "",
  description: "",
  notes: "",
}

const ProjectForm = ({ project, onDone }: { project?: IProject | null; onDone: () => void }) => {
  const isEdit = Boolean(project)

  const { data: clientsData } = useQuery(clientsListQuery())
  const clients = clientsData?.data ?? []

  // The columns this agency actually uses, rather than a list baked in here.
  const { data: statusData } = useQuery(workflowStatusesListQuery("kind=project"))
  const statuses = statusData?.data ?? []

  const { run: saveProject, isPending } = useActionMutation({
    action: (values: IProjectFormValues) =>
      project ? updateProjectAction(project.id, values) : createProjectAction(values),
    successMessage: isEdit ? "Project updated successfully" : "Project created successfully",
    invalidateKeys: [queryKeys.projects.all, queryKeys.dashboard.all],
  })

  const form = useForm({
    defaultValues: project
      ? {
          client_id: project.client_id,
          name: project.name,
          code: project.code,
          status_id: project.status.id,
          start_date: project.start_date ?? "",
          end_date: project.end_date ?? "",
          contract_value_usd: String(project.contract_value_usd ?? ""),
          description: project.description ?? "",
          notes: project.notes ?? "",
        }
      : emptyValues,
    onSubmit: async ({ value }) => {
      if (await saveProject(value)) onDone()
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
      <form.Field name="client_id" validators={{ onChange: projectFormZodSchema.shape.client_id }}>
        {(field) => (
          <EntitySelect
            id={field.name}
            label="Client"
            value={field.state.value}
            onChange={field.handleChange}
            disabled={isPending}
            emptyMessage="Add a client first"
            options={clients.map((client) => ({
              value: client.id,
              label: client.name,
              hint: client.company || undefined,
            }))}
            error={
              field.state.meta.isTouched && field.state.meta.errors.length > 0
                ? "Choose a client"
                : null
            }
          />
        )}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="name" validators={{ onChange: projectFormZodSchema.shape.name }}>
          {(field) => (
            <AppField field={field} label="Name" placeholder="e.g. Marketing site" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="code" validators={{ onChange: projectFormZodSchema.shape.code }}>
          {(field) => (
            <AppField
              field={field}
              label="Code"
              placeholder="e.g. ACME-WEB"
              // Fixed after creation, so editing it here would be a lie.
              disabled={isPending || isEdit}
            />
          )}
        </form.Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="status_id">
          {(field) => (
            <EntitySelect
              id={field.name}
              label="Status"
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              disabled={isPending}
              // Read from the board rather than a constant, and only the
              // columns that are switched on — a retired one is somewhere
              // work can sit, not somewhere it can be put.
              options={statuses
                .filter((status) => status.is_active)
                .map((status) => ({ value: status.id, label: status.name }))}
            />
          )}
        </form.Field>

        <form.Field name="contract_value_usd">
          {(field) => (
            <AppField
              field={field}
              label="Contract value (USD)"
              type="number"
              placeholder="0.00"
              disabled={isPending}
            />
          )}
        </form.Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="start_date">
          {(field) => <AppField field={field} label="Start date" type="date" disabled={isPending} />}
        </form.Field>

        <form.Field name="end_date">
          {(field) => <AppField field={field} label="End date" type="date" disabled={isPending} />}
        </form.Field>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <AppSubmitButton
          isPending={isPending}
          pendingLabel={isEdit ? "Saving..." : "Creating..."}
          className="w-auto"
        >
          {isEdit ? "Save changes" : "Create project"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

const ProjectFormModal = ({
  project,
  open,
  onOpenChange,
}: {
  project?: IProject | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next)
      else setInternalOpen(next)
    },
    [isControlled, onOpenChange],
  )

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button" className="ml-auto shrink-0">
            <Plus className="size-4" />
            New project
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "The code cannot change — payments and expenses already reference it."
              : "Work for one client. Payments, expenses and payouts can all be tied to it."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            <ProjectForm
              key={project?.id ?? "create"}
              project={project}
              onDone={() => setOpen(false)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectFormModal
