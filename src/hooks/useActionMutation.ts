"use client"

import { UNREACHABLE_MESSAGE } from "@/lib/actionError"
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface ActionOutcome {
    success: boolean
    message?: string
}

interface ActionMutationOptions<TVariables, TResult extends ActionOutcome> {
    action: (variables: TVariables) => Promise<TResult>
    // false: no success toast, for changes the screen already shows (a moved card, a toggled switch).
    successMessage?: string | false
    invalidateKeys?: QueryKey[]
    refresh?: boolean
    // Runs after the invalidations settle, for callers that need the result.
    onSuccess?: (result: TResult) => void
    // Replaces the error toast, for forms that show the refusal beside the button.
    onError?: (message: string) => void
}

// One mutation flow for every form: call the action, toast the outcome,
// invalidate, refresh. run() resolves true on success so the caller can reset
// and close. Its identity is stable, so it is safe in columns and effects.
export const useActionMutation = <TVariables, TResult extends ActionOutcome>(
    options: ActionMutationOptions<TVariables, TResult>,
) => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const latest = useRef(options)
    const { mutateAsync } = useMutation({
        mutationFn: (variables: TVariables) => latest.current.action(variables),
    })
    // Pending for the whole of run(), refetches included: a button that came back
    // while the lists were still refetching could send the action twice.
    const [isPending, setIsPending] = useState(false)

    useLayoutEffect(() => {
        latest.current = options
    })

    const run = useCallback(
        async (variables: TVariables): Promise<boolean> => {
            const { successMessage, invalidateKeys = [], refresh = true, onSuccess, onError } = latest.current
            const reportError = onError ?? ((message: string) => toast.error(message))
            setIsPending(true)

            try {
                let result: TResult
                try {
                    result = await mutateAsync(variables)
                } catch {
                    // Only the server action transport itself can throw (offline, deploy in flight).
                    reportError(UNREACHABLE_MESSAGE)
                    return false
                }

                if (!result.success) {
                    reportError(result.message || "Something went wrong")
                    return false
                }

                if (successMessage !== false) toast.success(successMessage ?? result.message ?? "Saved")
                await Promise.all(invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
                onSuccess?.(result)
                if (refresh) router.refresh()
                return true
            } finally {
                setIsPending(false)
            }
        },
        [mutateAsync, queryClient, router],
    )

    return { run, isPending }
}
