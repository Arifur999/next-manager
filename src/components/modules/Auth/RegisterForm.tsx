"use client"

import { registerAction } from "@/app/(commonLayout)/(auth)/register/_action"
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
import { registerFormZodSchema, type IRegisterFormValues } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Creating a company.
 *
 * Not "creating an account" — the distinction matters and the copy says so.
 * Registering makes a new workspace with its own clients, money and team, and
 * makes you its first admin. Everybody else joins by being invited from inside
 * it, which is why there is no role picker here: a form that let you choose
 * your own role is not an access control.
 *
 * Both links to this page (the landing page and the sign-in form) have existed
 * since the beginning and pointed at a 404, so nobody could sign up at all.
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
  const [showPassword, setShowPassword] = useState(false)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IRegisterFormValues) => registerAction(values),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value)

      if (!result.success) {
        // "An account with this email already exists" is the server's own
        // wording and the only useful thing to say.
        toast.error(result.message || "Could not create your workspace")
        return
      }

      toast.success("Workspace created. Sign in to get started.")

      // Deliberately not signed in automatically. Register returns the user,
      // not tokens, so the only honest next step is the sign-in form - and
      // typing the password once more confirms it is the one they meant.
      router.replace(`/login?email=${encodeURIComponent(value.email)}`)
    },
  })

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create your workspace</CardTitle>
          <CardDescription>
            This sets up a new company and makes you its admin. Your team joins by
            invitation from inside it.
          </CardDescription>
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
            <form.Field
              name="organization_name"
              validators={{ onChange: registerFormZodSchema.shape.organization_name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Company name"
                  placeholder="Naxified Agency"
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
                  placeholder="Habib Rahman"
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
                  placeholder="you@agency.com"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <AppField
                  field={field}
                  label="Phone (optional)"
                  disabled={isPending}
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{ onChange: registerFormZodSchema.shape.password }}
            >
              {(field) => (
                <div className="relative">
                  <AppField
                    field={field}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters, with a letter and a number"
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-7"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              )}
            </form.Field>

            <AppSubmitButton isPending={isPending} pendingLabel="Creating...">
              Create workspace
            </AppSubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have one?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterForm
