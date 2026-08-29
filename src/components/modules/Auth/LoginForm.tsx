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
import { getDefaultDashboardRoute, isValidRedirectForRole } from "@/lib/authUtils"
import { toUserRole } from "@/types/user.types"
import { loginFormZodSchema, type ILoginFormValues } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

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
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      // The action never throws, so success is a value to branch on.
      if (!result.success) {
        toast.error(result.message || "Failed to sign in")
        return
      }

      toast.success(result.message || "Signed in successfully")

      const role = toUserRole("data" in result ? result.data?.user?.role : undefined)
      const fallback = role ? getDefaultDashboardRoute(role) : "/"

      // Only honour ?redirect= when the signed-in role may actually reach it -
      // otherwise the proxy would bounce them straight back out again.
      const requested = searchParams.get("redirect")
      const destination =
        requested && role && isValidRedirectForRole(requested, role) ? requested : fallback

      router.push(destination)
      router.refresh()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Naxified workspace.</CardDescription>
      </CardHeader>

      <CardContent>
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
          <form.Field name="email" validators={{ onChange: loginFormZodSchema.shape.email }}>
            {(field) => (
              <AppField
                field={field}
                label="Email"
                type="email"
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
                placeholder="Your password"
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
