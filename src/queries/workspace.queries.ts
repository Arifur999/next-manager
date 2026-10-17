// One queryOptions per read; pages prefetch with the same builders components use.
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import { FEED_PAGE_SIZE, nextPageOf } from "@/lib/paging"
import { queryKeys } from "@/lib/queryKeys"
import { buildQueryString, type QueryRecord } from "@/lib/queryString"
import { getPermissionGrid } from "@/services/permission.services"
import { getActivity, getActivityFilters, getChatUnreadCount, getConversations, getCredentials, getLoginEvents, getMessages, getNotificationRules, getNotifications, getOrganization, getUnreadCount } from "@/services/workspace.services"

// The audit feed pages with page + limit; growing one limit stopped at the API's cap of 200.
export const activityFeedQuery = (filters: QueryRecord) =>
  infiniteQueryOptions({
    queryKey: queryKeys.activity.list(`feed:${buildQueryString(filters)}`),
    queryFn: ({ pageParam }) => getActivity(buildQueryString({ ...filters, page: pageParam, limit: FEED_PAGE_SIZE })),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => nextPageOf(lastPage, lastPageParam),
  })

export const activityFiltersQuery = () =>
  queryOptions({ queryKey: queryKeys.activityFilters.list(), queryFn: () => getActivityFilters() })

// Under the conversations root, so every invalidation the chat board already
// makes (a message read, sent or arriving) refreshes the sidebar badge too.
export const chatUnreadQuery = () =>
  queryOptions({ queryKey: queryKeys.conversations.count("unread"), queryFn: () => getChatUnreadCount() })

export const conversationsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.conversations.list(queryString), queryFn: () => getConversations(queryString) })

export const credentialsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.credentials.list(queryString), queryFn: () => getCredentials(queryString) })

export const loginEventsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.loginEvents.list(queryString), queryFn: () => getLoginEvents(queryString) })

export const messagesQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.messages.detail(id), queryFn: () => getMessages(id) })

export const notificationRulesQuery = () =>
  queryOptions({ queryKey: queryKeys.notificationRules.list(), queryFn: () => getNotificationRules() })

export const notificationsQuery = () =>
  queryOptions({ queryKey: queryKeys.notifications.list(), queryFn: () => getNotifications() })

export const organizationQuery = () =>
  queryOptions({ queryKey: queryKeys.organization.list(), queryFn: () => getOrganization() })

// No user id is the role grid; with one it is that person's overrides.
export const permissionGridQuery = (userId = "") =>
  queryOptions({ queryKey: queryKeys.permissions.detail(userId), queryFn: () => getPermissionGrid(userId || undefined) })

export const unreadCountQuery = () =>
  queryOptions({ queryKey: queryKeys.notificationsUnread.list(), queryFn: () => getUnreadCount() })
