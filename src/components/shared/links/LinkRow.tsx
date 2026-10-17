"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toSafeExternalUrl } from "@/lib/safeUrl"
import { useForm } from "@tanstack/react-form"
import { Check, ExternalLink, Pencil, Trash2, X } from "lucide-react"
import type { z } from "zod"

export type StoredLink = { id: string; label: string; url: string; notes: string }
export type LinkFormValues = { label: string; url: string }

/** Just the host, so a wall of long Drive URLs stays scannable. */
const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "")
  } catch {
    // The server validates the URL, so this only happens for rows written
    // before it did. Showing the raw value beats showing nothing.
    return url
  }
}

type EditLinkFormProps = {
  link: StoredLink
  formSchema: z.ZodType<LinkFormValues, LinkFormValues>
  onSave: (values: LinkFormValues) => Promise<boolean>
  onDone: () => void
  isPending: boolean
}

const EditLinkForm = ({ link, formSchema, onSave, onDone, isPending }: EditLinkFormProps) => {
  const form = useForm({
    defaultValues: { label: link.label, url: link.url },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      if (await onSave(value)) onDone()
    },
  })

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="label">
        {(field) => (
          <div className="min-w-40 flex-1 space-y-1.5">
            <Label htmlFor={`link-label-${link.id}`}>What it is</Label>
            <Input
              id={`link-label-${link.id}`}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="url">
        {(field) => (
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor={`link-url-${link.id}`}>Link</Label>
            <Input
              id={`link-url-${link.id}`}
              type="url"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <div className="flex gap-1">
        <form.Subscribe selector={(state) => formSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="submit" size="icon" variant="ghost" disabled={isPending || !isComplete}>
              <Check className="size-4" />
              <span className="sr-only">Save {link.label}</span>
            </Button>
          )}
        </form.Subscribe>
        <Button type="button" size="icon" variant="ghost" disabled={isPending} onClick={onDone}>
          <X className="size-4" />
          <span className="sr-only">Keep it as it was</span>
        </Button>
      </div>
    </form>
  )
}

type LinkRowProps = {
  link: StoredLink
  formSchema: z.ZodType<LinkFormValues, LinkFormValues>
  canManage: boolean
  isEditing: boolean
  onEditingChange: (isEditing: boolean) => void
  onSave: (values: LinkFormValues) => Promise<boolean>
  onRemove: () => void
  isPending: boolean
}

// One stored link: opened in a new tab with no way back into this one, renamed
// or repointed in place, or removed.
const LinkRow = ({ link, formSchema, canManage, isEditing, onEditingChange, onSave, onRemove, isPending }: LinkRowProps) => {
  if (isEditing) {
    return (
      <li className="px-5 py-3.5">
        <EditLinkForm
          link={link}
          formSchema={formSchema}
          onSave={onSave}
          onDone={() => onEditingChange(false)}
          isPending={isPending}
        />
      </li>
    )
  }

  const href = toSafeExternalUrl(link.url)

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 truncate text-sm font-medium underline-offset-4 hover:underline"
          >
            {link.label}
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          <p className="truncate text-sm font-medium">{link.label}</p>
        )}
        <p className="truncate text-xs text-muted-foreground">
          {hostOf(link.url)}
          {link.notes ? ` · ${link.notes}` : ""}
        </p>
      </div>

      {canManage && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => onEditingChange(true)}>
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit {link.label}</span>
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onRemove}>
            <Trash2 className="size-3.5" />
            <span className="sr-only">Remove {link.label}</span>
          </Button>
        </div>
      )}
    </li>
  )
}

export default LinkRow
