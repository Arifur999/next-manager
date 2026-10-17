"use client"

import { loginAction } from "@/app/(commonLayout)/(auth)/login/_action"
import FormErrorAlert from "@/components/modules/Auth/FormErrorAlert"
import PasswordField from "@/components/modules/Auth/PasswordField"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { safeRedirect } from "@/lib/authUtils"
import { toUserRole } from "@/types/user.types"
import { loginFormZodSchema, type ILoginFormValues } from "@/zod/auth.validation"
import { useActionMutation } from "@/hooks/useActionMutation"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { Info } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { useRef, useState } from "react"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [refusal, setRefusal] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  // The dashboard layout sends a revoked session here with this reason (C08).
  const sessionEnded = searchParams.get("reason") === "session-expired"

  // A registration whose automatic sign-in failed sends the new admin here with
  // their email attached, so they are not asked to type it again.
  const defaultValues: ILoginFormValues = {
    email: searchParams.get("email") ?? "",
    password: "",
  }

  // The hook's router refresh runs after onSuccess, so the push lands first.
  const { run: signIn, isPending } = useActionMutation({
    action: loginAction,
    successMessage: "Logged in successfully",
    onError: setRefusal,
    onSuccess: (result) => {
      if (!result.success) return

      const role = toUserRole(result.data?.user?.role)
      const destination = role ? safeRedirect(searchParams.get("redirect"), role) : "/"

      // Whatever a previous session left in this browser's cache is not theirs.
      queryClient.clear()
      router.push(destination)
    },
  })

  // Checked on submit, then on every change once a submit has been tried, so
  // nobody is told their email is invalid two letters into typing it.
  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      setRefusal(null)
      await signIn(value)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        </CardTitle>
        <CardDescription>Sign in to your Naxified workspace.</CardDescription>
      </CardHeader>

      <CardContent>
        {sessionEnded && (
          <div role="alert" className="mb-5 flex gap-2.5 rounded-md border bg-info-subtle px-3 py-2.5 text-sm text-info-subtle-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>Your session ended. Sign in again.</p>
          </div>
        )}
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
          <form.Field name="email" validators={{ onDynamic: loginFormZodSchema.shape.email }}>
            {(field) => (
              <AppField field={field} label="Email" type="email" autoComplete="email" disabled={isPending} />
            )}
          </form.Field>

          <form.Field name="password" validators={{ onDynamic: loginFormZodSchema.shape.password }}>
            {(field) => <PasswordField field={field} label="Password" purpose="current" disabled={isPending} />}
          </form.Field>

          {/* Under the password field, where somebody looks the moment their
              first attempt fails — not buried at the bottom with the sign-up
              link, which is a different intention entirely. */}
          <div className="-mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <FormErrorAlert message={refusal} />

          <AppSubmitButton isPending={isPending} pendingLabel="Signing in...">
            Sign in
          </AppSubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="h-auto p-0 underline underline-offset-4">
            <Link href="/register">Create one</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}

export default LoginForm
