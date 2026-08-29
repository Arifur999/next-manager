"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/agencio.services"
import type { INotification } from "@/types/platform.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Bell } from "lucide-react"
import { useState } from "react"

/**
 * What the platform has told this company.
 *
 * Everybody gets it, not only the person who pays: "the servers move on Sunday"
 * is for whoever works on Sunday.
 *
 * The count and the list are separate requests on purpose. The badge is what
 * gets fetched repeatedly, and fetching the full list to render one number
 * would pull every message body across the wire for a digit. The list is only
 * fetched once the panel is actually opened.
 */

const NotificationBell = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: countData } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadCount(),
    // Announcements are rare and never urgent to the minute. A tighter loop
    // would be one request per user per interval, forever, for a number that
    // changes a handful of times a year.
    refetchInterval: 5 * 60 * 1000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: open,
  })

  const unread = countData?.data?.unread ?? 0
  const notifications = (data?.data ?? []) as INotification[]

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] })
  }

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: refresh,
  })

  const { mutate: markAll, isPending: isMarkingAll } = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: refresh,
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
          <Bell className="size-4" />
          {unread > 0 && (
            // A number, not a dot: "3 things happened" and "something happened"
            // are answered differently, and only one needs opening now.
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium leading-none text-primary-foreground">
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
              onClick={() => markAll()}
            >
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="h-24 animate-pulse bg-muted/40" />
        ) : notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing yet. Notices from AGENCIO show up here.
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={notification.read_at ? "px-4 py-3" : "bg-muted/40 px-4 py-3"}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
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
                      {formatDistanceToNow(parseISO(notification.published_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => markRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
