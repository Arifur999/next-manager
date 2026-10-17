"use client"

import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { shareholderFormZodSchema, type IShareholderFormValues } from "@/zod/finance.validation"
import { useForm } from "@tanstack/react-form"

const defaultValues: IShareholderFormValues = { name: "", share_pct: "" }

const ShareholderFormCard = ({
  onSubmit,
  isPending,
}: {
  // Resolves true once the shareholder is saved.
  onSubmit: (values: IShareholderFormValues) => Promise<boolean>
  isPending: boolean
}) => {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: shareholderFormZodSchema },
    onSubmit: async ({ value, formApi }) => {
      if (await onSubmit(value)) formApi.reset()
    },
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add a shareholder</CardTitle>
      </CardHeader>

      <form
        method="POST"
        action="#"
        noValidate
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field name="name">
          {(field) => <AppField field={field} label="Name" disabled={isPending} />}
        </form.Field>

        <form.Field name="share_pct">
          {(field) => (
            <div className="space-y-1.5">
              <AppField field={field} label="Share (%)" type="number" placeholder="0" disabled={isPending} />
              <p className="text-xs text-muted-foreground">
                Everybody still active has to add up to 100% or less. Retiring somebody
                frees their share for whoever takes it on.
              </p>
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => !state.values.name.trim()}>
          {(isNameMissing) => (
            <AppSubmitButton isPending={isPending} pendingLabel="Adding..." disabled={isNameMissing}>
              Add
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </form>
    </Card>
  )
}

export default ShareholderFormCard
