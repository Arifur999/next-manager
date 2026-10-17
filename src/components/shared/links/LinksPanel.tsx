"use client"

import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import LinkRow, { type LinkFormValues, type StoredLink } from "@/components/shared/links/LinkRow"
import EmptyState from "@/components/shared/state/EmptyState"
import PanelState from "@/components/shared/state/PanelState"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { ApiResult } from "@/types/api.types"
import { useForm } from "@tanstack/react-form"
import type { QueryKey } from "@tanstack/react-query"
import { FolderOpen } from "lucide-react"
import { useState } from "react"
import type { z } from "zod"

type LinksPanelProps = {
  /** "client" or "project", for the sentences. */
  owner: string
  linksQuery: { isError: boolean; isLoading: boolean; isFetching: boolean; refetch: () => unknown }
  links: StoredLink[]
  formSchema: z.ZodType<LinkFormValues, LinkFormValues>
  invalidateKey: QueryKey
  /** False for anybody the API refuses: the controls come off rather than failing when pressed. */
  canManage: boolean
  addLink: (values: LinkFormValues) => Promise<ApiResult<unknown>>
  updateLink: (id: string, values: LinkFormValues) => Promise<ApiResult<unknown>>
  removeLink: (id: string) => Promise<ApiResult<unknown>>
}

const emptyLink: LinkFormValues = { label: "", url: "" }

/**
 * Where a client's or a project's work actually lives.
 *
 * Links, not uploads. The files are already in Drive or Figma, and a second
 * copy here would be one more thing to keep in step and one more place for a
 * client's material to leak from.
 */
const LinksPanel = ({
  owner,
  linksQuery,
  links,
  formSchema,
  invalidateKey,
  canManage,
  addLink,
  updateLink,
  removeLink,
}: LinksPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [linkToRemove, setLinkToRemove] = useState<StoredLink | null>(null)

  const { run: add, isPending: isAdding } = useActionMutation({
    action: addLink,
    successMessage: "Link added",
    invalidateKeys: [invalidateKey],
    refresh: false,
  })

  const { run: update, isPending: isUpdating } = useActionMutation({
    action: ({ id, values }: { id: string; values: LinkFormValues }) => updateLink(id, values),
    successMessage: "Link updated",
    invalidateKeys: [invalidateKey],
    refresh: false,
  })

  const { run: remove, isPending: isRemoving } = useActionMutation({
    action: removeLink,
    successMessage: false,
    invalidateKeys: [invalidateKey],
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyLink,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await add(value)) formApi.reset()
    },
  })

  const handleRemove = async () => {
    if (linkToRemove && (await remove(linkToRemove.id))) setLinkToRemove(null)
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Links</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drive folders, Figma files, staging sites — wherever this {owner}&apos;s work actually lives.
        </p>
      </CardHeader>

      {canManage && (
        <form
          className="flex flex-wrap items-end gap-3 border-b px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="label">
            {(field) => (
              <div className="min-w-40 flex-1 space-y-1.5">
                <Label htmlFor="link-label">What it is</Label>
                <Input
                  id="link-label"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Brand folder"
                  disabled={isAdding}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="url">
            {(field) => (
              <div className="min-w-56 flex-1 space-y-1.5">
                <Label htmlFor="link-url">Link</Label>
                <Input
                  id="link-url"
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  disabled={isAdding}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => formSchema.safeParse(state.values).success}>
            {(isComplete) => (
              <Button type="submit" disabled={isAdding || !isComplete}>
                Add
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}

      <PanelState
        query={linksQuery}
        errorMessage="The links did not load."
        isEmpty={links.length === 0}
        empty={<EmptyState icon={FolderOpen}>Nothing stored yet.</EmptyState>}
      >
        <ul className="divide-y">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              formSchema={formSchema}
              canManage={canManage}
              isEditing={editingId === link.id}
              onEditingChange={(isEditing) => setEditingId(isEditing ? link.id : null)}
              onSave={(values) => update({ id: link.id, values })}
              onRemove={() => setLinkToRemove(link)}
              isPending={isUpdating || isRemoving}
            />
          ))}
        </ul>
      </PanelState>

      <ConfirmDialog
        open={linkToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setLinkToRemove(null)
        }}
        title="Remove this link?"
        description={
          <>
            <span className="font-medium text-foreground">{linkToRemove?.label}</span> comes off this{" "}
            {`${owner}'s`} page. The folder or file it points to is not touched.
          </>
        }
        variant="destructive"
        confirmLabel="Remove"
        pendingLabel="Removing..."
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
      />
    </Card>
  )
}

export default LinksPanel
