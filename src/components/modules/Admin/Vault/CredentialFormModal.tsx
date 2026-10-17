"use client"

import {
  createCredentialAction,
  updateCredentialAction,
} from "@/app/(dashboardLayout)/admin/dashboard/vault/_action"
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
import { useActionMutation } from "@/hooks/useActionMutation"
import { queryKeys } from "@/lib/queryKeys"
import { clientsListQuery } from "@/queries/crm.queries"
import { projectsListQuery } from "@/queries/project.queries"
import type { ICredential } from "@/types/workspace.types"
import { credentialFormZodSchema, type ICredentialFormValues } from "@/zod/workspace.validation"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import { Eye, EyeOff, Plus } from "lucide-react"
import { useCallback, useState } from "react"

const emptyValues: ICredentialFormValues = {
  label: "",
  client_id: "",
  project_id: "",
  url: "",
  username: "",
  password: "",
  notes: "",
}

// The list carries only a mask, so an edit starts with the password empty.
const toFormValues = (credential: ICredential): ICredentialFormValues => ({
  label: credential.label,
  client_id: credential.client_id ?? "",
  project_id: credential.project_id ?? "",
  url: credential.url ?? "",
  username: credential.username ?? "",
  password: "",
  notes: "",
})

const CredentialForm = ({ credential, onDone }: { credential?: ICredential | null; onDone: () => void }) => {
  const [showPassword, setShowPassword] = useState(false)

  const { data: clientsData } = useQuery(clientsListQuery())
  const { data: projectsData } = useQuery(projectsListQuery())
  const clients = clientsData?.data ?? []
  const projects = projectsData?.data ?? []

  const { run: saveCredential, isPending } = useActionMutation({
    action: (values: ICredentialFormValues) =>
      credential ? updateCredentialAction(credential.id, values) : createCredentialAction(values),
    successMessage: credential ? "Credential updated" : "Credential created successfully",
    invalidateKeys: [queryKeys.credentials.all],
    refresh: false,
  })

  const form = useForm({
    defaultValues: credential ? toFormValues(credential) : emptyValues,
    onSubmit: async ({ value }) => {
      if (await saveCredential(value)) onDone()
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
      className="space-y-5"
    >
      <form.Field name="label" validators={{ onChange: credentialFormZodSchema.shape.label }}>
        {(field) => (
          <AppField field={field} label="Label" placeholder="e.g. Acme cPanel" disabled={isPending} />
        )}
      </form.Field>

      <form.Field name="url" validators={{ onChange: credentialFormZodSchema.shape.url }}>
        {(field) => <AppField field={field} label="URL" placeholder="https://..." disabled={isPending} />}
      </form.Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="username">
          {(field) => <AppField field={field} label="Username" autoComplete="off" disabled={isPending} />}
        </form.Field>

        <form.Field
          name="password"
          // An edit may leave it blank to keep the stored one.
          validators={credential ? undefined : { onChange: credentialFormZodSchema.shape.password }}
        >
          {(field) => (
            <AppField
              field={field}
              label={credential ? "New password" : "Password"}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isPending}
              description={credential ? "Leave blank to keep the current one." : undefined}
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
          {credential ? "Save changes" : "Save credential"}
        </AppSubmitButton>
      </DialogFooter>
    </form>
  )
}

type CredentialFormModalProps = {
  /** Absent for create; present for edit. */
  credential?: ICredential | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Add a credential, or edit one: rename it, move it, or rotate its password.
 * The form mounts only while the dialog is open, so a typed or shown password
 * never survives into the next time it opens.
 */
const CredentialFormModal = ({ credential, open, onOpenChange }: CredentialFormModalProps) => {
  // Uncontrolled as the "Add" trigger, controlled when a card opens it for an edit.
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) onOpenChange?.(next)
      else setInternalOpen(next)
    },
    [isControlled, onOpenChange],
  )

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button" className="shrink-0">
            <Plus className="size-4" />
            Add credential
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:w-[min(88vw,36rem)] lg:max-w-[min(88vw,36rem)]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>{credential ? `Edit ${credential.label}` : "Add credential"}</DialogTitle>
          <DialogDescription>
            {credential
              ? "A new password is encrypted before it is stored, and the change goes on the access log."
              : "Encrypted before it is stored. Only an explicit reveal decrypts it, and every reveal is logged against the person who asked."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            {isOpen && (
              <CredentialForm
                key={credential?.id ?? "create"}
                credential={credential}
                onDone={() => setOpen(false)}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default CredentialFormModal
