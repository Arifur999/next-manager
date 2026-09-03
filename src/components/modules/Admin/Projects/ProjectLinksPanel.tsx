"use client"

import {
  addProjectLinkAction,
  removeProjectLinkAction,
} from "@/app/(dashboardLayout)/admin/dashboard/projects/_linkAction"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProjectLinks } from "@/services/agencio.services"
import type { IProjectLink } from "@/types/agencio.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ExternalLink, FolderOpen, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Where this project's work actually lives.
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

const ProjectLinksPanel = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState("")
  const [url, setUrl] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["project-links", projectId],
    queryFn: () => getProjectLinks(`project_id=${projectId}`),
  })

  const links = (data?.data ?? []) as IProjectLink[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["project-links", projectId] })
  }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () =>
      addProjectLinkAction({ project_id: projectId, label: label.trim(), url: url.trim() }),
    onSuccess: (result) => {
      if (!result.success) {
        // "Only http and https links can be stored" arrives here.
        toast.error(result.message || "Could not add the link")
        return
      }
      toast.success("Link added")
      setLabel("")
      setUrl("")
      refresh()
    },
  })

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => removeProjectLinkAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || "Could not remove the link")
        return
      }
      refresh()
    },
  })

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Links</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drive folders, Figma files, staging sites — wherever this project&apos;s work
          actually lives.
        </p>
      </CardHeader>

      <form
        className="flex flex-wrap items-end gap-3 border-b px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!label.trim() || !url.trim()) return
          add()
        }}
      >
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="link-label">What it is</Label>
          <Input
            id="link-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Brand folder"
            disabled={isPending}
          />
        </div>

        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="link-url">Link</Label>
          <Input
            id="link-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://drive.google.com/..."
            disabled={isPending}
          />
        </div>

        <Button type="submit" disabled={isPending || !label.trim() || !url.trim()}>
          Add
        </Button>
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
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 truncate text-sm font-medium underline-offset-4 hover:underline"
                >
                  {link.label}
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                </a>
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
                onClick={() => remove(link.id)}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Remove {link.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ProjectLinksPanel
