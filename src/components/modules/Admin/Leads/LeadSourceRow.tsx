"use client"

import {
  deleteLeadSourceAction,
  updateLeadSourceAction,
} from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import AppField from "@/components/shared/form/AppField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { plural } from "@/lib/text"
import type { ILeadSource } from "@/types/crm.types"
import { leadSourceFormZodSchema } from "@/zod/crm.validation"
import { useForm } from "@tanstack/react-form"
import { Check, Pencil, Trash2, X } from "lucide-react"
import { useState } from "react"

// A rename shows on every card that came from this source.
const SOURCE_KEYS = [queryKeys.leadSources.all, queryKeys.leads.all]

const RenameSourceForm = ({ source, onDone }: { source: ILeadSource; onDone: () => void }) => {
  const { run: rename, isPending } = useActionMutation({
    action: (name: string) => updateLeadSourceAction(source.id, { name }),
    successMessage: "Source renamed",
    invalidateKeys: SOURCE_KEYS,
    refresh: false,
  })

  // Its own field name, so its input never shares an id with the add form's.
  const form = useForm({
    defaultValues: { source_name: source.name },
    onSubmit: async ({ value }) => {
      if (await rename(value.source_name)) onDone()
    },
  })

  return (
    <form
      noValidate
      className="flex flex-1 items-start gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="source_name" validators={{ onChange: leadSourceFormZodSchema.shape.name }}>
        {(field) => (
          <AppField field={field} label={`New name for ${source.name}`} className="flex-1" disabled={isPending} />
        )}
      </form.Field>
      <div className="flex gap-1 pt-6">
        <Button type="submit" size="icon" variant="ghost" disabled={isPending}>
          <Check className="size-4" />
          <span className="sr-only">Save the name</span>
        </Button>
        <Button type="button" size="icon" variant="ghost" disabled={isPending} onClick={onDone}>
          <X className="size-4" />
          <span className="sr-only">Keep the old name</span>
        </Button>
      </div>
    </form>
  )
}

type LeadSourceRowProps = {
  source: ILeadSource
  /** Admin only, as at the API. */
  canDelete: boolean
  /** One rename at a time, decided by the list. */
  isRenaming: boolean
  onRenamingChange: (isRenaming: boolean) => void
}

// One source: rename it, turn it off so it leaves the picker, or delete one nobody used.
const LeadSourceRow = ({ source, canDelete, isRenaming, onRenamingChange }: LeadSourceRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const leadCount = source._count?.leads ?? 0

  const { run: setActive, isPending: isToggling } = useActionMutation({
    action: (isActive: boolean) => updateLeadSourceAction(source.id, { is_active: isActive }),
    successMessage: false,
    invalidateKeys: SOURCE_KEYS,
    refresh: false,
  })

  const { run: removeSource, isPending: isRemoving } = useActionMutation({
    action: deleteLeadSourceAction,
    successMessage: "Source deleted",
    invalidateKeys: SOURCE_KEYS,
    refresh: false,
  })

  const handleDelete = async () => {
    if (await removeSource(source.id)) setIsDeleting(false)
  }

  if (isRenaming) {
    return (
      <li className="px-1 py-2">
        <RenameSourceForm source={source} onDone={() => onRenamingChange(false)} />
      </li>
    )
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-1 py-2">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-medium">
          <span className="truncate">{source.name}</span>
          {!source.is_active && <Badge variant="outline">Off</Badge>}
        </p>
        <p className="text-xs text-muted-foreground">{plural(leadCount, "lead")}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button type="button" size="icon" variant="ghost" onClick={() => onRenamingChange(true)}>
          <Pencil className="size-4" />
          <span className="sr-only">Rename {source.name}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isToggling}
          onClick={() => void setActive(!source.is_active)}
        >
          {source.is_active ? "Turn off" : "Turn on"}
        </Button>
        {canDelete && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            // A source with leads keeps their history; the API refuses and says to turn it off.
            disabled={leadCount > 0}
            title={leadCount > 0 ? "Leads came from it, so turn it off instead" : undefined}
            onClick={() => setIsDeleting(true)}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete {source.name}</span>
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title={`Delete ${source.name}?`}
        description="No lead came from it, so nothing loses its history. It leaves the picker for good."
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isRemoving}
        onConfirm={() => void handleDelete()}
      />
    </li>
  )
}

export default LeadSourceRow
