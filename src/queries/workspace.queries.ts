// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getPermissionGrid } from "@/services/permission.services"
import { getActivity, getActivityFilters, getConversations, getCredentials, getLoginEvents, getMessages, getNotificationRules, getNotifications, getOrganization, getUnreadCount } from "@/services/workspace.services"

export const activityQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.activity.list(queryString), queryFn: () => getActivity(queryString) })

export const activityFiltersQuery = () =>
  queryOptions({ queryKey: queryKeys.activityFilters.list(), queryFn: () => getActivityFilters() })

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
