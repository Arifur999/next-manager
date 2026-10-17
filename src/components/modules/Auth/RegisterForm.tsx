"use client"

import { registerAction } from "@/app/(commonLayout)/(auth)/register/_action"
import FormErrorAlert from "@/components/modules/Auth/FormErrorAlert"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCtaMicrocopy } from "@/data/site"
import { useActionMutation } from "@/hooks/useActionMutation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { registerFormZodSchema, type IRegisterFormValues } from "@/zod/auth.validation"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

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

const RegisterForm = ({ trialDays }: { trialDays: number | null }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [refusal, setRefusal] = useState<string | null>(null)

  // The action signs the new admin in, so this lands on their dashboard; when
  // that sign-in fails it lands on /login with the email filled in instead.
  const { run: createWorkspace, isPending } = useActionMutation({
    action: registerAction,
    onError: setRefusal,
    onSuccess: (result) => {
      if (!result.success) return

      queryClient.clear()
      router.push(result.data?.destination ?? "/login")
    },
  })

  // Checked on submit, then on every change once a submit has been tried.
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      setRefusal(null)
      await createWorkspace(value)
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
              validators={{ onDynamic: registerFormZodSchema.shape.organization_name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Company name"
                  autoComplete="organization"
                  placeholder="e.g. Northwind Studio"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="full_name" validators={{ onDynamic: registerFormZodSchema.shape.full_name }}>
              {(field) => <AppField field={field} label="Your name" autoComplete="name" disabled={isPending} />}
            </form.Field>

            <form.Field name="email" validators={{ onDynamic: registerFormZodSchema.shape.email }}>
              {(field) => (
                <AppField field={field} label="Email" type="email" autoComplete="email" disabled={isPending} />
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

            <form.Field name="password" validators={{ onDynamic: registerFormZodSchema.shape.password }}>
              {(field) => <PasswordField field={field} label="Password" disabled={isPending} />}
            </form.Field>

            <FormErrorAlert message={refusal} />

            <div className="space-y-2">
              <AppSubmitButton isPending={isPending} pendingLabel="Creating...">
                Create workspace
              </AppSubmitButton>
              {/* The same line the landing page puts under its CTA, from the same plans. */}
              <p className="text-center text-xs text-muted-foreground">{getCtaMicrocopy(trialDays)}</p>
            </div>
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
