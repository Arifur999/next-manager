"use client"

import { AUDIENCE_LABEL } from "@/components/modules/Platform/announcementAudience"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IAnnouncement } from "@/types/platform.types"
import { Mail, Send, Trash2 } from "lucide-react"

type AnnouncementDraftsProps = {
  drafts: IAnnouncement[]
  onEdit: (draft: IAnnouncement) => void
  onPublish: (draft: IAnnouncement) => void
  onRemove: (draft: IAnnouncement) => void
}

// Notices written but not yet sent to anybody.
const AnnouncementDrafts = ({ drafts, onEdit, onPublish, onRemove }: AnnouncementDraftsProps) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Drafts</CardTitle>
      <p className="text-sm text-muted-foreground">
        {drafts.length === 0 ? "Nothing waiting." : `${drafts.length} not yet sent to anybody.`}
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
              <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                Edit
              </Button>
              <Button size="sm" onClick={() => onPublish(row)}>
                <Send className="size-3.5" aria-hidden="true" />
                Publish
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(row)}
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
)

export default AnnouncementDrafts
