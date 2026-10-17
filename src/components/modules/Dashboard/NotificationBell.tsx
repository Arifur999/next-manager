"use client"

import { site } from "@/data/site"
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(dashboardLayout)/_notificationAction"
import RelativeTime from "@/components/shared/RelativeTime"
import PanelState from "@/components/shared/state/PanelState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import { useState } from "react"
import { notificationsQuery, unreadCountQuery } from "@/queries/workspace.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Everything one person needs to know, in one place.
 *
 * Two sources: notices from the platform, and notifications from inside their
 * own company. One panel and one badge, because two bells would be two things
 * to ignore and a badge counting half of what the panel shows is worse than
 * no badge at all.
 *
 * The platform ones reach everybody, not only the person who pays: "the
 * servers move on Sunday" is for whoever works on Sunday.
 *
 * The count and the list are separate requests on purpose. The badge is what
 * gets fetched repeatedly, and fetching the full list to render one number
 * would pull every message body across the wire for a digit. The list is only
 * fetched once the panel is actually opened.
 */

// The list and the badge both change when anything is marked read.
const BELL_KEYS = [queryKeys.notifications.all, queryKeys.notificationsUnread.all]

const NotificationBell = () => {
  const [open, setOpen] = useState(false)

  // A task assignment can wait a minute; a tighter poll is a request per user,
  // forever, for a number that changes a few times a day.
  const { data: countData } = useQuery({ ...unreadCountQuery(), refetchInterval: 60 * 1000 })

  const notificationsList = useQuery({ ...notificationsQuery(), enabled: open })

  const unread = countData?.data?.unread ?? 0
  const notifications = notificationsList.data?.data ?? []

  // Silent on success: the "new" badge going away is the confirmation.
  const { run: markRead } = useActionMutation({
    action: markNotificationReadAction,
    successMessage: false,
    invalidateKeys: BELL_KEYS,
    refresh: false,
  })

  const { run: markAll, isPending: isMarkingAll } = useActionMutation({
    action: markAllNotificationsReadAction,
    successMessage: false,
    invalidateKeys: BELL_KEYS,
    refresh: false,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell aria-hidden="true" className="size-4" />
          {unread > 0 && (
            // A number, not a dot: "3 things happened" and "something happened"
            // are answered differently, and only one needs opening now.
            <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium leading-none text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-88 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={isMarkingAll}
              onClick={() => void markAll(undefined)}
            >
              Mark all read
            </Button>
          )}
        </div>

        <PanelState
          query={notificationsList}
          errorMessage="Your notifications did not load."
          isEmpty={notifications.length === 0}
          empty={
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nothing yet. Work assigned to you, and notices from {site.name}, show up here.
            </p>
          }
        >
          <ScrollArea className="max-h-96">
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={notification.read_at ? "px-4 py-3" : "bg-muted/40 px-4 py-3"}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {/* Said, not colour-coded: a notice from AGENCIO and one
                        from your own team need different reactions. */}
                    {notification.source === "platform" && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {site.shortName}
                      </Badge>
                    )}
                    {!notification.read_at && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        new
                      </Badge>
                    )}
                  </div>

                  {/* Whitespace is preserved because the blank lines the
                      operator typed are the only formatting there is. */}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {notification.body}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      <RelativeTime value={notification.published_at} />
                    </span>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => void markRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PanelState>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
