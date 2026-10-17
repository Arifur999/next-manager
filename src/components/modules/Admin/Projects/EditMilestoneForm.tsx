"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { IMilestone } from "@/types/project.types"
import { milestoneFormZodSchema, type IMilestoneFormValues } from "@/zod/project.validation"
import { useForm } from "@tanstack/react-form"
import { Check, X } from "lucide-react"

type EditMilestoneFormProps = {
  milestone: IMilestone
  isPending: boolean
  onSave: (values: IMilestoneFormValues) => Promise<boolean>
  onDone: () => void
}

// Retitle a milestone or move its date, in place on its row.
const EditMilestoneForm = ({ milestone, isPending, onSave, onDone }: EditMilestoneFormProps) => {
  const form = useForm({
    defaultValues: { title: milestone.title, due_date: milestone.due_date.slice(0, 10) },
    validators: { onSubmit: milestoneFormZodSchema },
    onSubmit: async ({ value }) => {
      if (await onSave(value)) onDone()
    },
  })

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor={`milestone-title-${milestone.id}`}>Milestone</Label>
            <Input
              id={`milestone-title-${milestone.id}`}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="due_date">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={`milestone-due-${milestone.id}`}>Due</Label>
            <Input
              id={`milestone-due-${milestone.id}`}
              type="date"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </form.Field>

      <div className="flex gap-1">
        <form.Subscribe selector={(state) => milestoneFormZodSchema.safeParse(state.values).success}>
          {(isComplete) => (
            <Button type="submit" size="icon" variant="ghost" disabled={isPending || !isComplete}>
              <Check className="size-4" />
              <span className="sr-only">Save {milestone.title}</span>
            </Button>
          )}
        </form.Subscribe>
        <Button type="button" size="icon" variant="ghost" disabled={isPending} onClick={onDone}>
          <X className="size-4" />
          <span className="sr-only">Keep it as it was</span>
        </Button>
      </div>
    </form>
  )
}

export default EditMilestoneForm
