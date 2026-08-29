"use client"

import { forgotPasswordAction } from "@/app/(commonLayout)/(auth)/forgot-password/_action"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { forgotPasswordFormZodSchema, type IForgotPasswordFormValues } from "@/zod/auth.validation"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { MailCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

/**
 * Asking for a reset link.
 *
 * The server answers identically whether the address has an account or not,
 * and this screen has to keep that promise — showing "no account with that
 * email" here would give away exactly what the API went to trouble to hide.
 *
 * So the confirmation is deliberately conditional in its wording: "if that
 * address has an account". It is not a hedge, it is the truth, and it also
 * stops somebody who mistyped their address from waiting forever for an email
 * that was never going to arrive.
 */

const ForgotPasswordForm = () => {
  const [sent, setSent] = useState(false)

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (values: IForgotPasswordFormValues) => forgotPasswordAction(values),
  })

  const form = useForm({
    defaultValues: { email: "" } as IForgotPasswordFormValues,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
      // Shown whatever came back. A failure that is visible only for real
      // addresses is the same leak by another route.
      setSent(true)
    },
  })

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Card>
        {sent ? (
          <>
            <CardHeader className="items-center text-center">
              <MailCheck className="size-8 text-muted-foreground" aria-hidden="true" />
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                If that address has an account, a reset link is on its way. It works once
                and expires in 30 minutes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
              <p>
                Nothing arrived? Check the address you typed — and your spam folder before
                asking again.
              </p>
              <p>
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Forgot your password</CardTitle>
              <CardDescription>
                Enter the email you sign in with and we will send a link to set a new
                password.
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
                  name="email"
                  validators={{ onChange: forgotPasswordFormZodSchema.shape.email }}
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

                <AppSubmitButton isPending={isPending} pendingLabel="Sending...">
                  Send reset link
                </AppSubmitButton>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

export default ForgotPasswordForm
