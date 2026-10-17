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
import { ANNOUNCEMENT_AUDIENCES } from "@/types/platform.types"
import { announcementFormZodSchema, type IAnnouncementFormValues } from "@/zod/platform.validation"
import { Megaphone, X } from "lucide-react"
import { useState } from "react"

type AnnouncementComposerProps = {
  draft: IAnnouncementFormValues
  onChange: (draft: IAnnouncementFormValues) => void
  isEditing: boolean
  isSaving: boolean
  onSave: () => void
  onStopEditing: () => void
}

type ComposerErrors = Partial<Record<"title" | "body", string>>

// The first message per field, so each error sits under the input it is about.
const errorsOf = (draft: IAnnouncementFormValues): ComposerErrors => {
  const parsed = announcementFormZodSchema.safeParse(draft)
  if (parsed.success) return {}

  const errors: ComposerErrors = {}
  for (const issue of parsed.error.issues) {
    const field = issue.path[0]
    if ((field === "title" || field === "body") && !errors[field]) errors[field] = issue.message
  }
  return errors
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
  const [errors, setErrors] = useState<ComposerErrors>({})

  // Checked on Save, then again on every change once a field has been flagged, so the error clears as it is fixed.
  const update = (next: IAnnouncementFormValues) => {
    onChange(next)
    if (errors.title || errors.body) setErrors(errorsOf(next))
  }

  const handleSave = () => {
    const found = errorsOf(draft)
    setErrors(found)
    if (!found.title && !found.body) onSave()
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4" aria-hidden="true" />
          {isEditing ? "Edit draft" : "New announcement"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            handleSave()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title" className={errors.title ? "text-destructive" : undefined}>
              Title
            </Label>
            <Input
              id="announcement-title"
              value={draft.title}
              maxLength={120}
              onChange={(event) => update({ ...draft, title: event.target.value })}
              placeholder="e.g. Maintenance on Sunday"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "announcement-title-error" : undefined}
            />
            {errors.title && (
              <p id="announcement-title-error" role="alert" className="text-sm text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcement-body" className={errors.body ? "text-destructive" : undefined}>
              Message
            </Label>
            <Textarea
              id="announcement-body"
              value={draft.body}
              rows={7}
              onChange={(event) => update({ ...draft, body: event.target.value })}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? "announcement-body-error announcement-body-hint" : "announcement-body-hint"}
            />
            <p id="announcement-body-hint" className="text-xs text-muted-foreground">
              Say what is happening and what they need to do. A blank line starts a new paragraph.
            </p>
            {errors.body && (
              <p id="announcement-body-error" role="alert" className="text-sm text-destructive">
                {errors.body}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcement-audience">Who sees it</Label>
            <Select
              value={draft.audience}
              onValueChange={(value) => {
                const audience = ANNOUNCEMENT_AUDIENCES.find((option) => option === value)
                if (audience) update({ ...draft, audience })
              }}
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
                onCheckedChange={(checked) => update({ ...draft, send_email: checked === true })}
              />
              <div className="space-y-1">
                <Label htmlFor="announcement-email" className="font-normal">
                  Email it as well
                </Label>
                <p className="text-xs text-muted-foreground">
                  Goes to each company&apos;s admin, not to everyone who works there.
                </p>
              </div>
            </div>

            {draft.send_email && (
              // Said before publishing, not discovered after: an unverified
              // sending domain silently reaches nobody but your own address.
              <p className="rounded bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
                Until your sending domain is verified with your mail provider, this only reaches your own address.
                The sent list shows how many it reached.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isEditing ? "Save changes" : "Save as draft"}
            </Button>
            {isEditing && (
              <Button type="button" variant="ghost" size="icon" onClick={onStopEditing} aria-label="Stop editing">
                <X className="size-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Saving sends nothing. Publishing is a separate step and cannot be undone.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default AnnouncementComposer
