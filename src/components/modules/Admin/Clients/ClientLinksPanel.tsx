"use client"

import { toSafeExternalUrl } from "@/lib/safeUrl"
import {
  addClientLinkAction,
  removeClientLinkAction,
} from "@/app/(dashboardLayout)/admin/dashboard/clients/_linkAction"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import { clientLinkFormZodSchema, type IClientLinkFormValues } from "@/zod/crm.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, FolderOpen, Trash2 } from "lucide-react"
import { clientLinksListQuery } from "@/queries/crm.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Where this client's work actually lives.
 *
 * Links, not uploads. The files are already in Drive or Figma, and a second
 * copy here would be one more thing to keep in step and one more place for a
 * client's material to leak from.
 *
 * Every link opens with `rel="noopener noreferrer"` and no exception: these
 * URLs are typed by colleagues, but a tab opened from here can otherwise reach
 * back into this one through `window.opener`.
 */

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

const emptyLink: IClientLinkFormValues = { label: "", url: "" }

const ClientLinksPanel = ({ clientId }: { clientId: string }) => {
  const { data, isLoading } = useQuery(clientLinksListQuery(`client_id=${clientId}`))

  const links = data?.data ?? []

  const { run: addLink, isPending } = useActionMutation({
    action: addClientLinkAction,
    successMessage: "Link added",
    invalidateKeys: [queryKeys.clientLinks.all],
    refresh: false,
  })

  const { run: removeLink, isPending: isRemoving } = useActionMutation({
    action: removeClientLinkAction,
    successMessage: false,
    invalidateKeys: [queryKeys.clientLinks.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyLink,
    validators: { onSubmit: clientLinkFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await addLink({ client_id: clientId, ...value })) formApi.reset()
    },
  })

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Links</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drive folders, Figma files, staging sites — wherever this client&apos;s work
          actually lives.
        </p>
      </CardHeader>

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
                disabled={isPending}
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
                disabled={isPending}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => clientLinkFormZodSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="submit" disabled={isPending || !isComplete}>
              Add
            </Button>
          )}
        </form.Subscribe>
      </form>

      {isLoading && links.length === 0 ? (
        <div className="h-24 animate-pulse bg-muted/40" />
      ) : links.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
          <FolderOpen className="size-7" aria-hidden="true" />
          Nothing stored yet.
        </p>
      ) : (
        <ul className="divide-y">
          {links.map((link) => {
            const href = toSafeExternalUrl(link.url)
            return (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
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

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRemoving}
                  onClick={() => void removeLink(link.id)}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Remove {link.label}</span>
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default ClientLinksPanel
