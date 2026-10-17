"use client"

import { createLeadSourceAction } from "@/app/(dashboardLayout)/admin/dashboard/leads/_action"
import LeadSourceRow from "@/components/modules/Admin/Leads/LeadSourceRow"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { leadSourcesQuery } from "@/queries/crm.queries"
import { leadSourceFormZodSchema } from "@/zod/crm.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Store } from "lucide-react"
import { useState } from "react"

const AddSourceForm = () => {
  const { run: addSource, isPending } = useActionMutation({
    action: createLeadSourceAction,
    successMessage: "Source added",
    invalidateKeys: [queryKeys.leadSources.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: leadSourceFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await addSource(value)) formApi.reset()
    },
  })

  return (
    <form
      noValidate
      className="flex items-start gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <AppField
            field={field}
            label="New source"
            placeholder="e.g. Upwork, Referral, Website"
            autoComplete="off"
            className="flex-1"
            disabled={isPending}
          />
        )}
      </form.Field>
      <AppSubmitButton isPending={isPending} pendingLabel="Adding..." className="mt-6 w-auto">
        Add
      </AppSubmitButton>
    </form>
  )
}

/**
 * The marketplaces and channels leads arrive through, curated per company.
 * A source with leads cannot be deleted, only turned off, so the reports that
 * count where work came from never lose a row.
 */
const LeadSourcesDialog = ({ canDelete }: { canDelete: boolean }) => {
  const [open, setOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const sourcesQuery = useQuery({ ...leadSourcesQuery(), enabled: open })
  const sources = sourcesQuery.data?.data ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="shrink-0">
          <Store className="size-4" />
          Manage sources
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead sources</DialogTitle>
          <DialogDescription>
            Where your leads come from. Turning one off takes it out of the picker and keeps the
            history of the leads that came from it.
          </DialogDescription>
        </DialogHeader>

        <AddSourceForm />

        <PanelState
          query={sourcesQuery}
          errorMessage="The sources did not load."
          isEmpty={sources.length === 0}
          empty={<EmptyState icon={Store}>No sources yet. Add the first one above.</EmptyState>}
        >
          <ul className="divide-y">
            {sources.map((source) => (
              <LeadSourceRow
                key={source.id}
                source={source}
                canDelete={canDelete}
                isRenaming={renamingId === source.id}
                onRenamingChange={(isRenaming) => setRenamingId(isRenaming ? source.id : null)}
              />
            ))}
          </ul>
        </PanelState>
      </DialogContent>
    </Dialog>
  )
}

export default LeadSourcesDialog
