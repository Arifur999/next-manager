"use client"

import { UNREACHABLE_MESSAGE } from "@/lib/actionError"
import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"

interface ActionOutcome {
    success: boolean
    message?: string
}

interface ActionMutationOptions<TVariables> {
    action: (variables: TVariables) => Promise<ActionOutcome>
    successMessage?: string
    invalidateKeys?: QueryKey[]
    refresh?: boolean
}

// One mutation flow for every form: call the action, toast the outcome,
// invalidate, refresh. run() resolves true on success so the caller can reset
// and close. Its identity is stable, so it is safe in columns and effects.
export const useActionMutation = <TVariables>(options: ActionMutationOptions<TVariables>) => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const latest = useRef(options)
    const { mutateAsync, isPending } = useMutation({
        mutationFn: (variables: TVariables) => latest.current.action(variables),
    })

    useLayoutEffect(() => {
        latest.current = options
    })

    const run = useCallback(
        async (variables: TVariables): Promise<boolean> => {
            const { successMessage, invalidateKeys = [], refresh = true } = latest.current

            let result: ActionOutcome
            try {
                result = await mutateAsync(variables)
            } catch {
                // Only the server action transport itself can throw (offline, deploy in flight).
                toast.error(UNREACHABLE_MESSAGE)
                return false
            }

            if (!result.success) {
                toast.error(result.message || "Something went wrong")
                return false
            }

            toast.success(successMessage ?? result.message ?? "Saved")
            await Promise.all(invalidateKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
            if (refresh) router.refresh()
            return true
        },
        [mutateAsync, queryClient, router],
    )

    return { run, isPending }
}
