"use client"

import { getPermissionGrid } from "@/services/permission.services"
import type { IPermissionGrid, PermissionScope } from "@/types/permission.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * The grid, and the one thing every write to it has in common.
 *
 * Each square saves on its own the moment it changes. A Save button over 168
 * squares is a button where a mistake in one corner cannot be told apart from a
 * deliberate change in another, and where two admins editing at once quietly
 * overwrite each other.
 *
 * The whole grid is refetched after every write rather than patched in place.
 * It is one small read, and the alternative — a local edit that assumes the
 * server agreed — is how a permissions screen ends up showing access somebody
 * does not have.
 */

export const permissionKey = (userId?: string) => ["permissions", userId ?? ""] as const

export const usePermissionGrid = (userId?: string) => {
    const queryClient = useQueryClient()

    const { data, isLoading, isFetching } = useQuery({
        queryKey: permissionKey(userId),
        queryFn: () => getPermissionGrid(userId),
    })

    const grid = data?.data as IPermissionGrid | undefined

    const { mutate, isPending } = useMutation({
        mutationFn: ({ run }: { run: () => Promise<{ success: boolean; message?: string }>; note: string }) =>
            run(),
        onSuccess: (result, variables) => {
            if (!result?.success) {
                toast.error(result?.message || "Could not change that permission")
                // A refetch even on failure: the screen must show what the
                // server holds, not the value somebody just tried to set.
                void queryClient.invalidateQueries({ queryKey: ["permissions"] })
                return
            }

            toast.success(variables.note)
            void queryClient.invalidateQueries({ queryKey: ["permissions"] })
        },
        onError: () => {
            toast.error("Could not change that permission")
            void queryClient.invalidateQueries({ queryKey: ["permissions"] })
        },
    })

    return { grid, isLoading, isBusy: isPending || isFetching, save: mutate }
}

/** Look one square up in a list of rows. */
export const scopeAt = (
    rows: Array<{ module: string; action: string; scope: PermissionScope }> | null | undefined,
    module: string,
    action: string,
) => rows?.find((row) => row.module === module && row.action === action)?.scope
