// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getAssignmentOverview, getMilestones, getProject, getProjectFinancials, getProjectLinks, getProjectMembers, getProjects } from "@/services/project.services"

export const assignmentOverviewQuery = () =>
  queryOptions({ queryKey: queryKeys.assignmentOverview.list(), queryFn: () => getAssignmentOverview() })

export const milestonesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.milestones.list(queryString), queryFn: () => getMilestones(queryString) })

export const projectDetailQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.projects.detail(id), queryFn: () => getProject(id) })

export const projectFinancialsQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.projectFinancials.detail(id), queryFn: () => getProjectFinancials(id) })

export const projectLinksListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.projectLinks.list(queryString), queryFn: () => getProjectLinks(queryString) })

export const projectMembersQuery = (projectId: string) =>
  queryOptions({ queryKey: queryKeys.projectMembers.detail(projectId), queryFn: () => getProjectMembers(projectId) })

export const projectsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.projects.list(queryString), queryFn: () => getProjects(queryString) })
