"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { IKpiTarget } from "@/types/insights.types"
import { kpiTargetValueFormZodSchema, type IKpiTargetValueFormValues } from "@/zod/insights.validation"
import { useForm } from "@tanstack/react-form"
import { Check, X } from "lucide-react"

type EditTargetValueFormProps = {
  target: IKpiTarget
  label: string
  isPending: boolean
  onSave: (values: IKpiTargetValueFormValues) => Promise<boolean>
  onDone: () => void
}

// A target's figure, changed in place on its row.
const EditTargetValueForm = ({ target, label, isPending, onSave, onDone }: EditTargetValueFormProps) => {
  const form = useForm({
    defaultValues: { target_value: String(target.target_value) },
    validators: { onSubmit: kpiTargetValueFormZodSchema },
    onSubmit: async ({ value }) => {
      if (await onSave(value)) onDone()
    },
  })

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field name="target_value">
        {(field) => (
          <Input
            type="number"
            min={0}
            className="w-28"
            aria-label={label}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            disabled={isPending}
          />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => kpiTargetValueFormZodSchema.safeParse(state.values).success}>
        {(isComplete) => (
          <Button type="submit" size="icon" variant="ghost" disabled={isPending || !isComplete}>
            <Check className="size-4" />
            <span className="sr-only">Save the target</span>
          </Button>
        )}
      </form.Subscribe>
      <Button type="button" size="icon" variant="ghost" disabled={isPending} onClick={onDone}>
        <X className="size-4" />
        <span className="sr-only">Keep the target as it was</span>
      </Button>
    </form>
  )
}

export default EditTargetValueForm
