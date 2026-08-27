"use client"

import {
  createCategoryAction,
  deleteCategoryAction,
  updateOrganizationAction,
} from "@/app/(dashboardLayout)/admin/dashboard/settings/_action"
import ExchangeRateSettings from "@/components/modules/Admin/Settings/ExchangeRateSettings"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBdt } from "@/lib/currency"
import { getExpenseCategories, getOrganization } from "@/services/agencio.services"
import type { IExpenseCategory, IOrganization } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

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

      toast.success("Profile updated")
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
          {(field) => <AppField field={field} label="Legal name" disabled={isPending} />}
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
        Save profile
      </AppSubmitButton>
    </form>
  )
}

const CategorySettings = () => {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [type, setType] = useState<"general" | "employee">("general")

  const { data } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => getExpenseCategories(),
  })

  const categories = (data?.data ?? []) as IExpenseCategory[]

  const { mutateAsync: create, isPending: isCreating } = useMutation({
    mutationFn: () => createCategoryAction({ name: name.trim(), type }),
  })

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
  })

  const handleCreate = async () => {
    if (!name.trim()) return

    const result = await create()

    if (!result.success) {
      toast.error(result.message || "Failed to create the category")
      return
    }

    toast.success("Category added")
    setName("")
    void queryClient.invalidateQueries({ queryKey: ["expense-categories"] })
  }

  const handleDelete = async (category: IExpenseCategory) => {
    const result = await remove(category.id)

    if (!result.success) {
      // The server refuses when expenses reference it, and explains why —
      // "deactivate it instead" is actionable, "delete failed" is not.
      toast.error(result.message || "Failed to delete the category")
      return
    }

    toast.success("Category deleted")
    void queryClient.invalidateQueries({ queryKey: ["expense-categories"] })
  }

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category name"
          className="min-w-0 flex-1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              void handleCreate()
            }
          }}
        />

        <Select value={type} onValueChange={(value) => setType(value as "general" | "employee")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" onClick={() => void handleCreate()} disabled={isCreating || !name.trim()}>
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Employee-type categories are reported alongside team payouts rather than with operating
        expenses, so the same money is not counted twice.
      </p>

      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm">{category.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {category.type}
                  {category.monthly_budget
                    ? ` · ${formatBdt(category.monthly_budget)} budget`
                    : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleDelete(category)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete {category.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const SettingsBoard = () => {
  const { data } = useQuery({
    queryKey: ["organization"],
    queryFn: () => getOrganization(),
  })

  const organization = data?.data as IOrganization | undefined

  return (
    <Tabs defaultValue="rate">
      <TabsList>
        <TabsTrigger value="rate">Exchange rate</TabsTrigger>
        <TabsTrigger value="categories">Expense categories</TabsTrigger>
        <TabsTrigger value="profile">Agency profile</TabsTrigger>
      </TabsList>

      <TabsContent value="rate" className="mt-4">
        <ExchangeRateSettings />
      </TabsContent>

      <TabsContent value="categories" className="mt-4">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Expense categories</CardTitle>
          </CardHeader>
          <CategorySettings />
        </Card>
      </TabsContent>

      <TabsContent value="profile" className="mt-4">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b px-5 py-4">
            <CardTitle className="text-base">Agency profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              What appears on invoices. Change the name here and it changes everywhere.
            </p>
          </CardHeader>

          {organization ? (
            // Keyed on the id so the form seeds once the fetch lands rather
            // than rendering empty and never picking the values up.
            <OrganizationForm key={organization.id} organization={organization} />
          ) : (
            <div className="h-64 animate-pulse bg-muted/40" />
          )}
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default SettingsBoard
