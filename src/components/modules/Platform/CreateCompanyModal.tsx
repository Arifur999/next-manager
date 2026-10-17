"use client"

import { createCompanyAction } from "@/app/(dashboardLayout)/platform/_action"
import { planOptionLabel } from "@/components/modules/Platform/planLabel"
import AppField from "@/components/shared/form/AppField"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useActionMutation } from "@/hooks/useActionMutation"
import { companyFormZodSchema, type ICompanyFormValues } from "@/zod/platform.validation"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { plansQuery } from "@/queries/platform.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Provisioning a company by hand, for a customer who agreed a price before
 * seeing the sign-up form. The workspace, its first admin and its subscription
 * are created together. The password is handed over out of band, which is why
 * an invite link is the recommended way in and this is the fallback.
 */

// A Select cannot hold "", which is what the form keeps for "let the API pick".
const DEFAULT_PLAN = "__default__"

const companyDefaults: ICompanyFormValues = {
  name: "",
  admin_name: "",
  admin_email: "",
  admin_password: "",
  plan_id: "",
  trial_days: "14",
}

type CreateCompanyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateCompanyModal = ({ open, onOpenChange }: CreateCompanyModalProps) => {
  const { data: plansData } = useQuery({ ...plansQuery(), enabled: open })

  const plans = plansData?.data ?? []

  const form = useForm({
    defaultValues: companyDefaults,
    onSubmit: async ({ value, formApi }) => {
      if (!(await createCompany(value))) return

      onOpenChange(false)
      // The plan and trial stay as chosen, for the next company sold the same way.
      formApi.reset(
        { ...companyDefaults, plan_id: value.plan_id, trial_days: value.trial_days },
        { keepDefaultValues: true },
      )
    },
  })

  const companyName = useStore(form.store, (state) => state.values.name.trim())

  const { run: createCompany, isPending } = useActionMutation({
    action: createCompanyAction,
    successMessage: `${companyName} created. Send them the password out of band.`,
    invalidateKeys: [queryKeys.platformCompanies.all, queryKeys.platformOverview.all],
    refresh: false,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a company</DialogTitle>
          <DialogDescription>
            Sets up the workspace, its first admin and its subscription at once. You hand
            the password over yourself and ask them to change it.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name" validators={{ onChange: companyFormZodSchema.shape.name }}>
            {(field) => (
              <AppField
                field={field}
                label="Company name"
                placeholder="e.g. Bright Pixel Agency"
                disabled={isPending}
              />
            )}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="admin_name"
              validators={{ onChange: companyFormZodSchema.shape.admin_name }}
            >
              {(field) => <AppField field={field} label="Admin's name" autoComplete="off" disabled={isPending} />}
            </form.Field>

            <form.Field
              name="admin_email"
              validators={{ onChange: companyFormZodSchema.shape.admin_email }}
            >
              {(field) => (
                <AppField field={field} label="Admin's email" type="email" autoComplete="off" disabled={isPending} />
              )}
            </form.Field>
          </div>

          <form.Field
            name="admin_password"
            validators={{ onChange: companyFormZodSchema.shape.admin_password }}
          >
            {(field) => (
              <AppField
                field={field}
                label="Starting password"
                autoComplete="off"
                description="At least 8 characters, with a letter and a number. Shown, not hidden, because you pass it on."
                disabled={isPending}
              />
            )}
          </form.Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="plan_id">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="company-plan">Plan</Label>
                  <Select
                    value={field.state.value || DEFAULT_PLAN}
                    onValueChange={(value) => field.handleChange(value === DEFAULT_PLAN ? "" : value)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="company-plan" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEFAULT_PLAN}>Cheapest active plan</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {planOptionLabel(plan)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field
              name="trial_days"
              validators={{ onChange: companyFormZodSchema.shape.trial_days }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Trial (days)"
                  type="number"
                  className="tabular-nums"
                  description="Leave empty to start them paying now."
                  disabled={isPending}
                />
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCompanyModal
