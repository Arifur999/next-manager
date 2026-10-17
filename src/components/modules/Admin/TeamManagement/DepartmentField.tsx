"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { departmentsQuery } from "@/queries/people.queries"
import { NO_DEPARTMENT } from "@/zod/user.validation"

/**
 * The department picker, shared by the create and edit forms.
 *
 * One component because the two forms would otherwise drift: the sentinel for
 * "no department" has to mean the same thing in both, and a Select cannot hold
 * an empty string.
 *
 * Only active departments are offered. A retired one still shows on people who
 * are already in it — that is the point of retiring rather than deleting — but
 * nobody new should be put into a team the agency has stopped using.
 */

const DepartmentField = ({
  value,
  onChange,
  disabled,
}: {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}) => {
  const { data } = useQuery(departmentsQuery())
  const all = data?.data ?? []

  // Keep a retired department visible while it is the one selected, so opening
  // somebody's row does not silently move them out of it on save.
  const options = all.filter((department) => department.is_active || department.id === value)

  return (
    <div className="space-y-1.5">
      <Label htmlFor="department-picker">Department</Label>
      <Select value={value || NO_DEPARTMENT} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="department-picker" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_DEPARTMENT}>No department</SelectItem>
          {options.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
              {department.is_active ? "" : " (off)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {all.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No departments yet —{" "}
          <Link
            href="/admin/dashboard/departments"
            className="text-primary underline-offset-4 hover:underline"
          >
            add some
          </Link>{" "}
          to split hours and cost by team.
        </p>
      )}
    </div>
  )
}

export default DepartmentField
