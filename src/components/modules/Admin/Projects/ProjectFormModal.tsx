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
import { getClients, getWorkflowStatuses } from "@/services/agencio.services"
import type { IClient, IProject, IWorkflowStatus } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const projectFormSchema = z.object({
  client_id: z.string().min(1, "Choose a client"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  // An id, not a word from a fixed list: the columns are the agency's now.
  status_id: z.string().min(1, "Choose a status"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  contract_value_usd: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
      "Contract value must be a number that is not negative",
    ),
  description: z.string().optional(),
  notes: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

const emptyValues: ProjectFormValues = {
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
  const queryClient = useQueryClient()
  const router = useRouter()
  const isEdit = Boolean(project)

  const { data: clientsData } = useQuery({ queryKey: ["clients", ""], queryFn: () => getClients() })
  const clients = (clientsData?.data ?? []) as IClient[]

  // The columns this agency actually uses, rather than a list baked in here.
  const { data: statusData } = useQuery({
    queryKey: ["workflow-statuses", "project"],
    queryFn: () => getWorkflowStatuses("kind=project"),
  })
  const statuses = (statusData?.data ?? []) as IWorkflowStatus[]

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: ProjectFormValues) => {
      const payload = {
        ...values,
        contract_value_usd: values.contract_value_usd ? Number(values.contract_value_usd) : 0,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
      }
      // The code is fixed after creation — the server rejects it on update, and
      // sending it anyway would look like an edit that silently did nothing.
      if (project) {
        const { code: _code, ...rest } = payload
        void _code
        return updateProjectAction(project.id, rest)
      }
      return createProjectAction(payload)
    },
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
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || `Failed to ${isEdit ? "update" : "create"} project`)
        return
      }

      toast.success(result.message || `Project ${isEdit ? "updated" : "created"} successfully`)
      onDone()

      void queryClient.invalidateQueries({ queryKey: ["projects"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      router.refresh()
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
      <form.Field name="client_id" validators={{ onChange: projectFormSchema.shape.client_id }}>
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
        <form.Field name="name" validators={{ onChange: projectFormSchema.shape.name }}>
          {(field) => (
            <AppField field={field} label="Name" placeholder="e.g. Marketing site" disabled={isPending} />
          )}
        </form.Field>

        <form.Field name="code" validators={{ onChange: projectFormSchema.shape.code }}>
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
