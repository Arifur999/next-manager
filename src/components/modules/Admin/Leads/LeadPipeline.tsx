"use client"

import {
  convertLeadAction,
  createLeadAction,
  updateLeadAction,
} from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import StatTile from "@/components/shared/StatTile"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatUsd } from "@/lib/currency"
import { getLeadPipeline } from "@/services/agencio.services"
import type { ILead, ILeadPipeline, LeadStage } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Plus, Target, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().optional(),
  stage: z.enum(["new", "contacted", "proposal", "negotiating", "won", "lost"]),
  estimated_value_usd: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
      "Estimated value must be a number that is not negative",
    ),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

// Only the open stages get a column. Won and lost are outcomes, not places work
// sits, and giving them columns would make the board grow forever.
const OPEN_STAGES: Array<{ stage: LeadStage; label: string }> = [
  { stage: "new", label: "New" },
  { stage: "contacted", label: "Contacted" },
  { stage: "proposal", label: "Proposal" },
  { stage: "negotiating", label: "Negotiating" },
]

const ALL_STAGES: LeadStage[] = ["new", "contacted", "proposal", "negotiating", "won", "lost"]

const CreateLeadModal = () => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: LeadFormValues) =>
      createLeadAction({
        ...values,
        estimated_value_usd: values.estimated_value_usd ? Number(values.estimated_value_usd) : 0,
      }),
  })

  const defaultValues: LeadFormValues = {
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "",
    stage: "new",
    estimated_value_usd: "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to create lead")
        return
      }

      toast.success("Lead added")
      setOpen(false)
      form.reset()
      void queryClient.invalidateQueries({ queryKey: ["leads"] })
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
          Add lead
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>A deal that has not been won yet.</DialogDescription>
        </DialogHeader>

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
          <form.Field name="name" validators={{ onChange: leadFormSchema.shape.name }}>
            {(field) => <AppField field={field} label="Name" disabled={isPending} />}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="company">
              {(field) => <AppField field={field} label="Company" disabled={isPending} />}
            </form.Field>

            <form.Field name="source">
              {(field) => (
                <AppField field={field} label="Source" placeholder="e.g. Upwork" disabled={isPending} />
              )}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="email" validators={{ onChange: leadFormSchema.shape.email }}>
              {(field) => <AppField field={field} label="Email" type="email" disabled={isPending} />}
            </form.Field>

            <form.Field name="phone">
              {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
            </form.Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="stage">
              {(field) => (
                <EntitySelect
                  id={field.name}
                  label="Stage"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as LeadStage)}
                  disabled={isPending}
                  options={ALL_STAGES.map((stage) => ({
                    value: stage,
                    label: stage.charAt(0).toUpperCase() + stage.slice(1),
                  }))}
                />
              )}
            </form.Field>

            <form.Field name="estimated_value_usd">
              {(field) => (
                <AppField
                  field={field}
                  label="Estimated value (USD)"
                  type="number"
                  placeholder="0.00"
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="w-auto">
              Add lead
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const LeadCard = ({ lead }: { lead: ILead }) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync: move, isPending: isMoving } = useMutation({
    mutationFn: (stage: LeadStage) => updateLeadAction(lead.id, { stage }),
  })

  const { mutateAsync: convert, isPending: isConverting } = useMutation({
    mutationFn: () => convertLeadAction(lead.id),
  })

  const handleMove = async (stage: LeadStage) => {
    const result = await move(stage)
    if (!result.success) {
      toast.error(result.message || "Failed to move lead")
      return
    }
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
  }

  const handleConvert = async () => {
    const result = await convert()

    if (!result.success) {
      toast.error(result.message || "Failed to convert lead")
      return
    }

    toast.success("Converted to a client")
    void queryClient.invalidateQueries({ queryKey: ["leads"] })
    void queryClient.invalidateQueries({ queryKey: ["clients"] })
    router.push("/admin/dashboard/clients")
  }

  const busy = isMoving || isConverting

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          {lead.company && (
            <p className="truncate text-xs text-muted-foreground">{lead.company}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" disabled={busy}>
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions for {lead.name}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {ALL_STAGES.filter((stage) => stage !== lead.stage).map((stage) => (
              <DropdownMenuItem key={stage} onClick={() => void handleMove(stage)}>
                Move to {stage}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => void handleConvert()}
              disabled={Boolean(lead.converted_client_id)}
            >
              {lead.converted_client_id ? "Already converted" : "Convert to client"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium tabular-nums">
          {formatUsd(lead.estimated_value_usd)}
        </span>
        {lead.source && (
          <span className="truncate text-[11px] text-muted-foreground">{lead.source}</span>
        )}
      </div>
    </div>
  )
}

const LeadPipeline = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => getLeadPipeline(),
  })

  const pipeline = data?.data as ILeadPipeline | undefined
  const byStage = (stage: LeadStage) =>
    pipeline?.stages.find((entry) => entry.stage === stage)?.leads ?? []

  const won = byStage("won")
  const lost = byStage("lost")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <StatTile
            label="Open pipeline"
            value={formatUsd(pipeline?.open_value_usd ?? 0)}
            // Won and lost are excluded on purpose: including them would make
            // this number grow forever and stop meaning anything.
            hint={`${pipeline?.open_count ?? 0} open deal${pipeline?.open_count === 1 ? "" : "s"} · won and lost excluded`}
            icon={<TrendingUp className="size-5" />}
            tone={1}
          />
          <StatTile
            label="Closed"
            value={`${won.length} won · ${lost.length} lost`}
            hint={
              won.length + lost.length > 0
                ? `${Math.round((won.length / (won.length + lost.length)) * 100)}% win rate`
                : "Nothing closed yet"
            }
            icon={<Target className="size-5" />}
            tone={3}
          />
        </div>

        <CreateLeadModal />
      </div>

      {isLoading && !pipeline ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {OPEN_STAGES.map((column) => (
            <Card key={column.stage} className="h-48 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {OPEN_STAGES.map((column) => {
            const leads = byStage(column.stage)
            const value = leads.reduce((running, lead) => running + lead.estimated_value_usd, 0)

            return (
              <Card key={column.stage} className="gap-0 overflow-hidden p-0">
                <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                  <CardTitle className="text-sm">{column.label}</CardTitle>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatUsd(value)}
                  </span>
                </CardHeader>

                <div className="space-y-2 p-3">
                  {leads.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
                  ) : (
                    leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
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

export default LeadPipeline
