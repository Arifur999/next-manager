"use client"

import {
  createDepartmentAction,
  deleteDepartmentAction,
  setDepartmentActiveAction,
  updateDepartmentAction,
} from "@/app/(dashboardLayout)/admin/dashboard/departments/_action"
import DepartmentList from "@/components/modules/Admin/Departments/DepartmentList"
import ConfirmDialog from "@/components/shared/dialog/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { IDepartment } from "@/types/people.types"
import { departmentFormZodSchema, type IDepartmentFormValues } from "@/zod/people.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Network, Plus, X } from "lucide-react"
import { useState } from "react"
import { departmentsQuery } from "@/queries/people.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * The teams inside the agency.
 *
 * Deliberately small. A department is a name and whether it is still in use;
 * everything that makes it useful lives somewhere else — the people list, the
 * payout filter, the delivery report. A configuration screen that grows
 * features is one people go to instead of the place the work happens.
 *
 * Turning one off is offered beside deleting it, because that is what the
 * server tells you to do the moment anybody is in it, and the pair reads better
 * than a refusal followed by hunting for the switch.
 */

const emptyDepartment: IDepartmentFormValues = { name: "", description: "" }

const DepartmentsBoard = () => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<IDepartment | null>(null)

  const { data, isLoading } = useQuery(departmentsQuery())

  const departments = data?.data ?? []

  const { run: saveDepartment, isPending } = useActionMutation({
    action: (values: IDepartmentFormValues) =>
      editingId ? updateDepartmentAction(editingId, values) : createDepartmentAction(values),
    successMessage: editingId ? "Department updated" : "Department added",
    invalidateKeys: [queryKeys.departments.all],
    refresh: false,
  })

  // No toast: the "off" badge appearing is the confirmation.
  const { run: toggleActive } = useActionMutation({
    action: (department: IDepartment) =>
      setDepartmentActiveAction(department.id, { is_active: !department.is_active }),
    successMessage: false,
    invalidateKeys: [queryKeys.departments.all],
    refresh: false,
  })

  const { run: removeDepartment, isPending: isDeleting } = useActionMutation({
    action: deleteDepartmentAction,
    successMessage: "Department deleted",
    invalidateKeys: [queryKeys.departments.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyDepartment,
    validators: { onSubmit: departmentFormZodSchema },
    onSubmit: async ({ value }) => {
      if (await saveDepartment(value)) stopEditing()
    },
  })

  const startEditing = (department: IDepartment) => {
    setEditingId(department.id)
    form.reset({ name: department.name, description: department.description }, { keepDefaultValues: true })
  }

  const stopEditing = () => {
    form.reset()
    setEditingId(null)
  }

  // The dialog stays open on a refusal, so "move them first" is read in place.
  const confirmDelete = async () => {
    if (!deleting) return
    const isDeleted = await removeDepartment(deleting.id)
    if (!isDeleted) return

    // Only the department being edited takes the form with it.
    if (editingId === deleting.id) stopEditing()
    setDeleting(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="size-4" aria-hidden="true" />
            {editingId ? "Edit department" : "New department"}
          </CardTitle>
        </CardHeader>

        <form
          className="space-y-4 px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="department-name">Name</Label>
                <Input
                  id="department-name"
                  value={field.state.value}
                  maxLength={60}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Design"
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor="department-description">What they do</Label>
                <Input
                  id="department-description"
                  value={field.state.value}
                  maxLength={200}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Optional"
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>

          <div className="flex items-center gap-2">
            <form.Subscribe selector={(state) => state.values.name.trim() === ""}>
              {(isNameBlank) => (
                <Button type="submit" disabled={isPending || isNameBlank} className="flex-1">
                  <Plus className="size-4" />
                  {editingId ? "Save changes" : "Add"}
                </Button>
              )}
            </form.Subscribe>
            {editingId && (
              <Button type="button" variant="ghost" size="icon" onClick={stopEditing} aria-label="Stop editing">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>

      <DepartmentList
        departments={departments}
        isLoading={isLoading}
        onEdit={startEditing}
        onToggle={(department) => void toggleActive(department)}
        onDelete={setDeleting}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Delete this department?"
        description={
          <>
            This removes <span className="font-medium text-foreground">{deleting?.name}</span>. A
            department with people in it cannot be deleted: move them first, or turn it off instead.
          </>
        }
        variant="destructive"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isDeleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}

export default DepartmentsBoard
