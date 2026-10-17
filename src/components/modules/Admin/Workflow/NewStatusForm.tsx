"use client"

import { createWorkflowStatusAction } from "@/app/(dashboardLayout)/admin/dashboard/workflow/_action"
import { STATUS_CATEGORIES } from "@/components/modules/Admin/Workflow/statusCategories"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  } from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import type { StatusCategory } from "@/types/common.types"
import { workflowStatusFormZodSchema, type IWorkflowStatusFormValues } from "@/zod/work.validation"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"
import { queryKeys } from "@/lib/queryKeys"

const emptyColumn: IWorkflowStatusFormValues = { name: "", category: "open" }

const NewStatusForm = ({ kind }: { kind: "task" | "project" }) => {
  const { run: add, isPending: isAdding } = useActionMutation({
    action: createWorkflowStatusAction,
    successMessage: "Added to the end of the board",
    invalidateKeys: [queryKeys.workflowStatuses.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: emptyColumn,
    validators: { onSubmit: workflowStatusFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      // Only the name clears, so several columns of one meaning can be added in a row.
      if (await add({ kind, ...value })) formApi.setFieldValue("name", "")
    },
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New column</CardTitle>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor="status-name">Name</Label>
              <Input
                id="status-name"
                value={field.state.value}
                maxLength={40}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={kind === "task" ? "In QA" : "Awaiting sign-off"}
                disabled={isAdding}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <EntitySelect
              id="status-category"
              label="What it means"
              value={field.state.value}
              onChange={field.handleChange}
              options={STATUS_CATEGORIES}
              description={STATUS_CATEGORIES.find((option) => option.value === field.state.value)?.blurb}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => workflowStatusFormZodSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="submit" disabled={isAdding || !isComplete} className="w-full">
              <Plus className="size-4" />
              Add
            </Button>
          )}
        </form.Subscribe>

        <p className="text-xs text-muted-foreground">
          The name is yours to change later. What it means is what the reports and the
          completion dates read, so that is asked for up front rather than guessed from
          the name.
        </p>
      </form>
    </Card>
  )
}

export default NewStatusForm
