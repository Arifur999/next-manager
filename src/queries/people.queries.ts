// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getAttendance, getDepartments, getInvites, getLeaveBalance, getLeaveRequests, getLeaveTypes, getPayrollRuns } from "@/services/people.services"
import { getAllUsers } from "@/services/user.services"

export const usersListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.users.list(queryString), queryFn: () => getAllUsers(queryString) })

export const attendanceQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.attendance.list(queryString), queryFn: () => getAttendance(queryString) })

export const departmentsQuery = () =>
  queryOptions({ queryKey: queryKeys.departments.list(), queryFn: () => getDepartments() })

export const invitesQuery = () =>
  queryOptions({ queryKey: queryKeys.teamInvites.list(), queryFn: () => getInvites() })

export const leaveBalanceQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.leaveBalance.list(queryString), queryFn: () => getLeaveBalance(queryString) })

export const leaveRequestsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.leaveRequests.list(queryString), queryFn: () => getLeaveRequests(queryString) })

export const leaveTypesQuery = () =>
  queryOptions({ queryKey: queryKeys.leaveTypes.list(), queryFn: () => getLeaveTypes() })

export const payrollRunsQuery = () =>
  queryOptions({ queryKey: queryKeys.payroll.list(), queryFn: () => getPayrollRuns() })
