"use client"

import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  publishAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/(dashboardLayout)/platform/_campaignAction"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IAnnouncement } from "@/types/platform.types"
import type { IAnnouncementFormValues } from "@/zod/platform.validation"
import { useQuery } from "@tanstack/react-query"
import { format, parseISO } from "date-fns"
import { Eye, Mail, Megaphone, Send, Trash2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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

type Audience = IAnnouncement["audience"]

const AUDIENCE_LABEL: Record<Audience, string> = {
  all: "Every customer",
  trialing: "Customers on a trial",
  active: "Paying customers",
}

/** What each audience is useful for, in the words somebody picking would use. */
const AUDIENCE_HINT: Record<Audience, string> = {
  all: "Maintenance, new features, anything everyone needs to know.",
  trialing: "Nudges and onboarding — people who have not decided yet.",
  active: "Billing, price changes, plan news. Includes anyone in their grace window.",
}

const emptyDraft = { title: "", body: "", audience: "all" as Audience, send_email: false }

const RemovalNote = ({ announcement }: { announcement: IAnnouncement }) => {
  const title = <span className="font-medium text-foreground">{announcement.title}</span>

  if (!announcement.published_at) return <>{title} has not gone to anybody, so nothing else changes.</>

  return (
    <>
      {title} leaves everyone&apos;s notifications.
      {announcement.send_email && " The email that went with it cannot be recalled."}
    </>
  )
}

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

  const { run: publish, isPending: isPublishing } = useActionMutation({
    action: publishAnnouncementAction,
    // The server phrases its message against what actually happened to the
    // email; a failed send gets the reason rather than a success tick.
    successMessage: false,
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
    onSuccess: (result) => {
      if (!result.success) return

      const email = result.data.email
      if (email && email.delivered < email.attempted) {
        toast.warning(result.message, { description: email.reason ?? undefined })
      } else {
        toast.success(result.message)
      }
    },
  })

  const { run: removeAnnouncement, isPending: isRemoving } = useActionMutation({
    action: deleteAnnouncementAction,
    successMessage: "Removed — it leaves everyone's notifications too",
    invalidateKeys: [queryKeys.platformAnnouncements.all],
    refresh: false,
  })

  const handleSave = async () => {
    if (await saveDraft(draft)) reset()
  }

  // The dialog stays open until the send settles, so a refusal is read in place.
  const handlePublish = async () => {
    if (confirming && (await publish(confirming.id))) setConfirming(null)
  }

  const handleRemove = async () => {
    if (!removing || !(await removeAnnouncement(removing.id))) return

    if (removing.id === editingId) reset()
    setRemoving(null)
  }

  const isWithdrawal = Boolean(removing?.published_at)

  const canSave = draft.title.trim().length > 0 && draft.body.trim().length > 0

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* ---------------------------------------------------------- composer */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Megaphone className="size-4" aria-hidden="true" />
            {editingId ? "Edit draft" : "New announcement"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={draft.title}
              maxLength={120}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Maintenance on Sunday"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcement-body">Message</Label>
            <Textarea
              id="announcement-body"
              value={draft.body}
              rows={7}
              onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              placeholder={"What is happening, and what they need to do.\n\nLeave a blank line between paragraphs."}
            />
            <p className="text-xs text-muted-foreground">
              Blank lines become paragraphs. Nothing else is formatted.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcement-audience">Who sees it</Label>
            <Select
              value={draft.audience}
              onValueChange={(value) => setDraft({ ...draft, audience: value as Audience })}
            >
              <SelectTrigger id="announcement-audience" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {AUDIENCE_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{AUDIENCE_HINT[draft.audience]}</p>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="announcement-email"
                checked={draft.send_email}
                onCheckedChange={(checked) =>
                  setDraft({ ...draft, send_email: checked === true })
                }
              />
              <div className="space-y-1">
                <Label htmlFor="announcement-email" className="font-normal">
                  Email it as well
                </Label>
                <p className="text-xs text-muted-foreground">
                  Goes to one address per customer — the admin you sold to — not to
                  everybody who works there.
                </p>
              </div>
            </div>

            {draft.send_email && (
              // Said before publishing, not discovered after: an unverified
              // sending domain silently reaches nobody but your own address.
              <p className="rounded bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
                Until your sending domain is verified with your mail provider, this only
                reaches your own address. The result below will say how many it actually got to.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => void handleSave()} disabled={!canSave || isSaving} className="flex-1">
              {editingId ? "Save changes" : "Save as draft"}
            </Button>
            {editingId && (
              <Button variant="ghost" size="icon" onClick={reset} aria-label="Stop editing">
                <X className="size-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Saving does not send anything. Publishing is a separate step, and cannot be undone.
          </p>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- list */}
      <div className="space-y-4">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Drafts</CardTitle>
            <p className="text-sm text-muted-foreground">
              {drafts.length === 0
                ? "Nothing waiting."
                : `${drafts.length} not yet sent to anybody.`}
            </p>
          </CardHeader>

          {drafts.length > 0 && (
            <ul className="divide-y">
              {drafts.map((row) => (
                <li key={row.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                  <div className="min-w-48 flex-1">
                    <p className="font-medium">{row.title}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{row.body}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{AUDIENCE_LABEL[row.audience]}</Badge>
                    {row.send_email && (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="size-3" aria-hidden="true" />
                        email
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(row.id)
                        setDraft({
                          title: row.title,
                          body: row.body,
                          audience: row.audience,
                          send_email: row.send_email,
                        })
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => setConfirming(row)}>
                      <Send className="size-3.5" aria-hidden="true" />
                      Publish
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setRemoving(row)}
                      aria-label={`Delete draft ${row.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

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

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(open) => {
          if (!open) setConfirming(null)
        }}
        title={`Send this to ${AUDIENCE_LABEL[confirming?.audience ?? "all"].toLowerCase()}?`}
        description={
          <>
            It appears in their notifications straight away
            {confirming?.send_email ? ", and is emailed to each customer's admin" : ""}. This
            cannot be undone, and the text can no longer be edited afterwards.
          </>
        }
        confirmLabel="Publish"
        pendingLabel="Publishing..."
        isPending={isPublishing}
        onConfirm={() => void handlePublish()}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null)
        }}
        title={isWithdrawal ? "Withdraw this announcement?" : "Delete this draft?"}
        description={removing && <RemovalNote announcement={removing} />}
        variant="destructive"
        confirmLabel={isWithdrawal ? "Withdraw" : "Delete"}
        pendingLabel={isWithdrawal ? "Withdrawing..." : "Deleting..."}
        isPending={isRemoving}
        onConfirm={() => void handleRemove()}
      />
    </div>
  )
}

export default CampaignBoard
