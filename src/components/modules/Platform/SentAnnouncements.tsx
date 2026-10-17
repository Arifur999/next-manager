"use client"

import { AUDIENCE_LABEL } from "@/components/modules/Platform/announcementAudience"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IAnnouncement, ISentAnnouncement } from "@/types/platform.types"
import { format, parseISO } from "date-fns"
import { Eye, Mail, Trash2 } from "lucide-react"

type SentAnnouncementsProps = {
  sent: ISentAnnouncement[]
  isLoading: boolean
  onRemove: (announcement: IAnnouncement) => void
}

// Notices that went out: who read them, and what happened to the email.
const SentAnnouncements = ({ sent, isLoading, onRemove }: SentAnnouncementsProps) => (
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="border-b px-5 py-4">
      <CardTitle className="text-base">Sent</CardTitle>
      <p className="text-sm text-muted-foreground">
        Published notices cannot be edited. Publish a correction instead.
      </p>
    </CardHeader>

    {isLoading ? (
      <LoadingBlock height="h-32" />
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
                <span>{format(parseISO(row.published_at), "d MMM yyyy, HH:mm")}</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3" aria-hidden="true" />
                  read by {row._count?.reads ?? 0}
                </span>
                {row.send_email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3" aria-hidden="true" />
                    {/* Null is not zero: it means the send never
                        reported back, which is a different problem. */}
                    {row.emailed_count === null ? "email result unknown" : `emailed ${row.emailed_count}`}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{AUDIENCE_LABEL[row.audience]}</Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(row)}
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
)

export default SentAnnouncements
