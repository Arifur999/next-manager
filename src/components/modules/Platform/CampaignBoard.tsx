"use client"

import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/(dashboardLayout)/platform/_campaignAction"
import AnnouncementComposer from "@/components/modules/Platform/AnnouncementComposer"
import AnnouncementDrafts from "@/components/modules/Platform/AnnouncementDrafts"
import PublishAnnouncementDialog from "@/components/modules/Platform/PublishAnnouncementDialog"
import RemoveAnnouncementDialog from "@/components/modules/Platform/RemoveAnnouncementDialog"
import { AUDIENCE_LABEL } from "@/components/modules/Platform/announcementAudience"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IAnnouncement } from "@/types/platform.types"
import type { IAnnouncementFormValues } from "@/zod/platform.validation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Eye, Mail, Trash2 } from "lucide-react"
import { useState } from "react"
import { announcementsQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Writing to customers.
 *
 * Two things this screen has to keep honest.
 *
 * **Publishing cannot be undone**, so it is a separate, confirmed action rather
 * than a checkbox on a form that saves as you type. The confirmation names the
 * audience, because "all customers" and "trials only" are one click apart and
 * the wrong one cannot be recalled.
 *
 * **It reports what happened to the email, not what was requested.** A send
 * that reached four of forty addresses says so. An operator told "sent" who
 * later finds nobody got it has been misled by their own tool.
 */

const emptyDraft: IAnnouncementFormValues = { title: "", body: "", audience: "all", send_email: false }

const CampaignBoard = () => {
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<IAnnouncement | null>(null)
  const [removing, setRemoving] = useState<IAnnouncement | null>(null)

  const { data, isLoading } = useQuery(announcementsQuery())

  const announcements = data?.data ?? []
  const drafts = announcements.filter((row) => !row.published_at)
  const sent = announcements.filter((row) => row.published_at)

  const reset = () => {
    setDraft(emptyDraft)
    setEditingId(null)
  }

  const { run: saveDraft, isPending: isSaving } = useActionMutation({
    action: (values: IAnnouncementFormValues) =>
      editingId ? updateAnnouncementAction(editingId, values) : createAnnouncementAction(values),
    successMessage: editingId ? "Draft updated" : "Saved as a draft — nobody sees it yet",
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
  })

  const handleSave = async () => {
    if (await saveDraft(draft)) reset()
  }

  const handleEdit = (row: IAnnouncement) => {
    setEditingId(row.id)
    setDraft({ title: row.title, body: row.body, audience: row.audience, send_email: row.send_email })
  }

  const handleRemoved = (id: string) => {
    if (id === editingId) reset()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <AnnouncementComposer
        draft={draft}
        onChange={setDraft}
        isEditing={Boolean(editingId)}
        isSaving={isSaving}
        onSave={() => void handleSave()}
        onStopEditing={reset}
      />

      {/* -------------------------------------------------------------- list */}
      <div className="space-y-4">
        <AnnouncementDrafts
          drafts={drafts}
          onEdit={handleEdit}
          onPublish={setConfirming}
          onRemove={setRemoving}
        />

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Sent</CardTitle>
            <p className="text-sm text-muted-foreground">
              Published notices cannot be edited. Publish a correction instead.
            </p>
          </CardHeader>

          {isLoading && announcements.length === 0 ? (
            <div className="h-32 animate-pulse bg-muted/40" />
          ) : sent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              You have not sent anything yet.
            </p>
          ) : (
            <ul className="divide-y">
              {sent.map((row) => (
                <li key={row.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                  <div className="min-w-48 flex-1">
                    <p className="font-medium">{row.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{row.body}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{format(parseISO(row.published_at as string), "d MMM yyyy, HH:mm")}</span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden="true" />
                        read by {row._count?.reads ?? 0}
                      </span>
                      {row.send_email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" aria-hidden="true" />
                          {/* Null is not zero: it means the send never
                              reported back, which is a different problem. */}
                          {row.emailed_count === null
                            ? "email result unknown"
                            : `emailed ${row.emailed_count}`}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{AUDIENCE_LABEL[row.audience]}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRemoving(row)}
                      aria-label={`Withdraw ${row.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PublishAnnouncementDialog announcement={confirming} onClose={() => setConfirming(null)} />

      <RemoveAnnouncementDialog
        announcement={removing}
        onClose={() => setRemoving(null)}
        onRemoved={handleRemoved}
      />
    </div>
  )
}

export default CampaignBoard
