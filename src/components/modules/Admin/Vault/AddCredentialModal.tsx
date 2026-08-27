"use client"

import { createCredentialAction } from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import EntitySelect from "@/components/shared/form/EntitySelect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getClients, getProjects } from "@/services/agencio.services"
import type { IClient, IProject } from "@/types/agencio.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, Plus } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

const credentialFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  client_id: z.string().optional(),
  project_id: z.string().optional(),
  url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional(),
})

type CredentialFormValues = z.infer<typeof credentialFormSchema>

const defaultValues: CredentialFormValues = {
  label: "",
  client_id: "",
  project_id: "",
  url: "",
  username: "",
  password: "",
  notes: "",
}

const AddCredentialModal = () => {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const queryClient = useQueryClient()

  const { data: clientsData } = useQuery({
    queryKey: ["clients", ""],
    queryFn: () => getClients(),
    enabled: open,
  })
  const { data: projectsData } = useQuery({
    queryKey: ["projects", ""],
    queryFn: () => getProjects(),
    enabled: open,
  })

  const clients = (clientsData?.data ?? []) as IClient[]
  const projects = (projectsData?.data ?? []) as IProject[]

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: CredentialFormValues) =>
      createCredentialAction({
        ...values,
        client_id: values.client_id || null,
        project_id: values.project_id || null,
      }),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        toast.error(result.message || "Failed to save credential")
        return
      }

      toast.success(result.message || "Credential saved")
      setOpen(false)
      form.reset()
      setShowPassword(false)

      void queryClient.invalidateQueries({ queryKey: ["credentials"] })
    },
  })

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        form.reset()
        // Never leave the field unmasked for whatever gets typed next time.
        setShowPassword(false)
      }
    },
    [form],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="shrink-0">
          <Plus className="size-4" />
          Add credential
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Add credential</DialogTitle>
          <DialogDescription>
            Encrypted before it is stored. Only an explicit reveal decrypts it, and every reveal is
            logged against the person who asked.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            <form
              method="POST"
              action="#"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-5"
            >
              <form.Field name="label" validators={{ onChange: credentialFormSchema.shape.label }}>
                {(field) => (
                  <AppField
                    field={field}
                    label="Label"
                    placeholder="e.g. Acme cPanel"
                    disabled={isPending}
                  />
                )}
              </form.Field>

              <form.Field name="url">
                {(field) => (
                  <AppField field={field} label="URL" placeholder="https://..." disabled={isPending} />
                )}
              </form.Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <form.Field name="username">
                  {(field) => <AppField field={field} label="Username" disabled={isPending} />}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{ onChange: credentialFormSchema.shape.password }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      disabled={isPending}
                      append={
                        <button
                          type="button"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      }
                    />
                  )}
                </form.Field>
              </div>

              <form.Field name="client_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Client (optional)"
                    value={field.state.value ?? ""}
                    onChange={field.handleChange}
                    disabled={isPending}
                    placeholder="Agency-internal"
                    emptyMessage="No clients yet"
                    options={clients.map((client) => ({ value: client.id, label: client.name }))}
                  />
                )}
              </form.Field>

              <form.Field name="project_id">
                {(field) => (
                  <EntitySelect
                    id={field.name}
                    label="Project (optional)"
                    value={field.state.value ?? ""}
                    onChange={field.handleChange}
                    disabled={isPending}
                    placeholder="Not tied to a project"
                    emptyMessage="No projects yet"
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      hint: project.code,
                    }))}
                  />
                )}
              </form.Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
                  Save credential
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default AddCredentialModal
