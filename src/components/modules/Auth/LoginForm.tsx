"use client"

import { loginAction } from "@/app/(commonLayout)/(auth)/login/_action"
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
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, Info } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { focusFirstInvalid } from "@/lib/focusFirstInvalid"
import { useRef, useState } from "react"
import { toast } from "sonner"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  // The dashboard layout sends a revoked session here with this reason (C08).
  const sessionEnded = searchParams.get("reason") === "session-expired"

  // Registering sends the new admin here with their email attached, so they
  // are not asked to type it again thirty seconds after choosing it. The
  // password is deliberately not carried over - typing it once more is what
  // confirms it is the one they meant.
  const defaultValues: ILoginFormValues = {
    email: searchParams.get("email") ?? "",
    password: "",
  }

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: ILoginFormValues) => loginAction(values),
  })

  const form = useForm({
    defaultValues,
    onSubmitInvalid: () => focusFirstInvalid(formRef.current),
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      // The action never throws, so success is a value to branch on.
      if (!result.success) {
        toast.error(result.message || "Failed to sign in")
        return
      }

      toast.success(result.message || "Signed in successfully")

      const role = toUserRole("data" in result ? result.data?.user?.role : undefined)
      const destination = role ? safeRedirect(searchParams.get("redirect"), role) : "/"

      // Whatever a previous session left in this browser's cache is not theirs.
      queryClient.clear()
      router.push(destination)
      router.refresh()
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
          <form.Field name="email" validators={{ onChange: loginFormZodSchema.shape.email }}>
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isPending}
              />
            )}
          </form.Field>

          <form.Field name="password" validators={{ onChange: loginFormZodSchema.shape.password }}>
            {(field) => (
              <AppField
                field={field}
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                disabled={isPending}
                append={
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                  </button>
                }
              />
            )}
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

          <AppSubmitButton isPending={isPending} pendingLabel="Signing in...">
            Sign in
          </AppSubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/register">Create one</Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  )
}

export default LoginForm
