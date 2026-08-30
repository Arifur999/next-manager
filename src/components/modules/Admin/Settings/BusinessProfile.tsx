"use client"

import { updateOrganizationAction } from "@/app/(dashboardLayout)/admin/dashboard/business/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrganization } from "@/services/agencio.services"
import type { IOrganization } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { z } from "zod"

/**
 * Who the agency is, on paper.
 *
 * This was a tab inside Settings, which is why it read as missing — the things
 * you change least often are the hardest to find when they are nested behind
 * something else.
 *
 * Everything here ends up on an invoice, so a change is not cosmetic: rename
 * the agency and every invoice raised from now on carries the new name.
 */

const organizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  legal_name: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
})

type OrganizationValues = z.infer<typeof organizationSchema>

const OrganizationForm = ({ organization }: { organization: IOrganization }) => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: OrganizationValues) => updateOrganizationAction(values),
  })

  const form = useForm({
    defaultValues: {
      name: organization.name,
      legal_name: organization.legal_name ?? "",
      email: organization.email ?? "",
      phone: organization.phone ?? "",
      website: organization.website ?? "",
      address: organization.address ?? "",
    } as OrganizationValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to update the profile")
        return
      }

      toast.success("Business information updated")
      void queryClient.invalidateQueries({ queryKey: ["organization"] })
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
        <form.Field name="name" validators={{ onChange: organizationSchema.shape.name }}>
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
        <form.Field name="email" validators={{ onChange: organizationSchema.shape.email }}>
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
  const { data } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganization(),
  })

  const organization = data?.data as IOrganization | undefined

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          What appears on invoices. Change the name here and it changes everywhere it is
          used from now on — invoices already sent keep the name they were sent under.
        </p>
      </CardHeader>

      {organization ? (
        // Keyed on the id so the form seeds once the fetch lands rather than
        // rendering empty and never picking the values up.
        <OrganizationForm key={organization.id} organization={organization} />
      ) : (
        <div className="h-64 animate-pulse bg-muted/40" />
      )}
    </Card>
  )
}

export default BusinessProfile
