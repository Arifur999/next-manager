"use client"

import { registerAction } from "@/app/(commonLayout)/(auth)/register/_action"
import AppField from "@/components/shared/form/AppField"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { registerFormZodSchema, type IRegisterFormValues } from "@/zod/auth.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { useForm } from "@tanstack/react-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { useRef } from "react"

/**
 * Creating a company.
 *
 * Not "creating an account" — the distinction matters and the copy says so.
 * Registering makes a new workspace with its own clients, money and team, and
 * makes you its first admin. Everybody else joins by being invited from inside
 * it, which is why there is no role picker here: a form that let you choose
 * your own role is not an access control.
 */

const defaultValues: IRegisterFormValues = {
  organization_name: "",
  full_name: "",
  email: "",
  phone: "",
  password: "",
}

const RegisterForm = () => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const { run: createWorkspace, isPending } = useActionMutation({
    action: registerAction,
    successMessage: "Workspace created. Sign in to get started.",
    refresh: false,
  })

  const form = useForm({
    defaultValues,
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      if (!(await createWorkspace(value))) return

      // Not signed in automatically: register returns the user, not tokens, and
      // typing the password once more confirms it is the one they meant.
      router.replace(`/login?email=${encodeURIComponent(value.email)}`)
    },
  })

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          </CardTitle>
          <CardDescription>
            This sets up a new company and makes you its admin. Your team joins by
            invitation from inside it.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            ref={formRef}
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
            <form.Field
              name="organization_name"
              validators={{ onChange: registerFormZodSchema.shape.organization_name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Company name"
                  autoComplete="organization"
                  placeholder="Northwind Studio"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field
              name="full_name"
              validators={{ onChange: registerFormZodSchema.shape.full_name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Your name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{ onChange: registerFormZodSchema.shape.email }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <AppField
                  field={field}
                  label="Phone (optional)"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{ onChange: registerFormZodSchema.shape.password }}
            >
              {(field) => (
                <PasswordField field={field} label="Password" disabled={isPending} />
              )}
            </form.Field>

            <AppSubmitButton isPending={isPending} pendingLabel="Creating...">
              Create workspace
            </AppSubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have one?{" "}
            <Link href="/login" className="text-primary-strong underline underline-offset-4 hover:decoration-2">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterForm
