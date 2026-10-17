"use client"

import { AUDIENCE_HINT, AUDIENCE_LABEL } from "@/components/modules/Platform/announcementAudience"
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
import { ANNOUNCEMENT_AUDIENCES, type AnnouncementAudience } from "@/types/platform.types"
import type { IAnnouncementFormValues } from "@/zod/platform.validation"
import { Megaphone, X } from "lucide-react"

type AnnouncementComposerProps = {
  draft: IAnnouncementFormValues
  onChange: (draft: IAnnouncementFormValues) => void
  isEditing: boolean
  isSaving: boolean
  onSave: () => void
  onStopEditing: () => void
}

// Writing a notice, new or an existing draft. Saving never sends anything.
const AnnouncementComposer = ({
  draft,
  onChange,
  isEditing,
  isSaving,
  onSave,
  onStopEditing,
}: AnnouncementComposerProps) => {
  const canSave = draft.title.trim().length > 0 && draft.body.trim().length > 0

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4" aria-hidden="true" />
          {isEditing ? "Edit draft" : "New announcement"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="announcement-title">Title</Label>
          <Input
            id="announcement-title"
            value={draft.title}
            maxLength={120}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            placeholder="Maintenance on Sunday"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="announcement-body">Message</Label>
          <Textarea
            id="announcement-body"
            value={draft.body}
            rows={7}
            onChange={(event) => onChange({ ...draft, body: event.target.value })}
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
            onValueChange={(value) => onChange({ ...draft, audience: value as AnnouncementAudience })}
          >
            <SelectTrigger id="announcement-audience" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANNOUNCEMENT_AUDIENCES.map((value) => (
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
              onCheckedChange={(checked) => onChange({ ...draft, send_email: checked === true })}
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
          <Button onClick={onSave} disabled={!canSave || isSaving} className="flex-1">
            {isEditing ? "Save changes" : "Save as draft"}
          </Button>
          {isEditing && (
            <Button variant="ghost" size="icon" onClick={onStopEditing} aria-label="Stop editing">
              <X className="size-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Saving does not send anything. Publishing is a separate step, and cannot be undone.
        </p>
      </CardContent>
    </Card>
  )
}

export default AnnouncementComposer
