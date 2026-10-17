"use client"

import { updateOrganizationAction } from "@/app/(dashboardLayout)/admin/dashboard/business/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { IOrganization } from "@/types/workspace.types"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { organizationFormZodSchema, type IOrganizationFormValues } from "@/zod/workspace.validation"
import { organizationQuery } from "@/queries/workspace.queries"
import { queryKeys } from "@/lib/queryKeys"

/**
 * Who the agency is, on paper.
 *
 * Everything here ends up on an invoice, so a change is not cosmetic: rename
 * the agency and every invoice raised from now on carries the new name.
 */

const OrganizationForm = ({ organization }: { organization: IOrganization }) => {
  const { run: saveOrganization, isPending } = useActionMutation({
    action: updateOrganizationAction,
    successMessage: "Business information updated",
    invalidateKeys: [queryKeys.organization.all],
    refresh: false,
  })

  const defaultValues: IOrganizationFormValues = {
    name: organization.name,
    legal_name: organization.legal_name ?? "",
    email: organization.email ?? "",
    phone: organization.phone ?? "",
    website: organization.website ?? "",
    address: organization.address ?? "",
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await saveOrganization(value)
    },
  })

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5 px-5 py-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="name" validators={{ onChange: organizationFormZodSchema.shape.name }}>
          {(field) => <AppField field={field} label="Agency name" disabled={isPending} />}
        </form.Field>

        <form.Field name="legal_name">
          {(field) => (
            <AppField
              field={field}
              label="Legal name"
              placeholder="If it differs from the trading name"
              disabled={isPending}
            />
          )}
        </form.Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="email" validators={{ onChange: organizationFormZodSchema.shape.email }}>
          {(field) => <AppField field={field} label="Email" type="email" disabled={isPending} />}
        </form.Field>

        <form.Field name="phone">
          {(field) => <AppField field={field} label="Phone" disabled={isPending} />}
        </form.Field>
      </div>

      <form.Field name="website">
        {(field) => <AppField field={field} label="Website" disabled={isPending} />}
      </form.Field>

      <form.Field name="address">
        {(field) => <AppField field={field} label="Address" disabled={isPending} />}
      </form.Field>

      <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
        Save
      </AppSubmitButton>
    </form>
  )
}

const BusinessProfile = () => {
  const { data, isLoading, isFetching, refetch } = useQuery(organizationQuery())

  const organization = data?.data

  const renderDetails = () => {
    if (isLoading) return <LoadingBlock height="h-64" />

    if (!organization) {
      return (
        <ErrorState
          message="The business details did not load."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      )
    }

    // Keyed on the id so the form seeds once the fetch lands rather than
    // rendering empty and never picking the values up.
    return <OrganizationForm key={organization.id} organization={organization} />
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          What appears on invoices. Change the name here and it changes everywhere it is
          used from now on — invoices already sent keep the name they were sent under.
        </p>
      </CardHeader>

      {renderDetails()}
    </Card>
  )
}

export default BusinessProfile
