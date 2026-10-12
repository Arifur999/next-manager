import { getActionErrorMessage } from "@/lib/actionError"
import type { ApiResponse, ApiResult } from "@/types/api.types"
import type { z } from "zod"

// Action helpers. They never throw: every outcome is an ApiResult the browser
// can branch on, and errors are turned into a safe message here.

export const runAction = async <TData>(
    fallbackMessage: string,
    run: () => Promise<ApiResponse<TData>>,
): Promise<ApiResult<TData>> => {
    try {
        const response = await run()
        if (!response.success) return { success: false, message: response.message || fallbackMessage }
        return { success: true, message: response.message, data: response.data, meta: response.meta }
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, fallbackMessage) }
    }
}

const toFieldErrors = (error: z.ZodError): Record<string, string[]> => {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of error.issues) {
        const field = issue.path.join(".") || "form"
        fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message]
    }
    return fieldErrors
}

// Validates on the server before the service is called, so a hand-crafted
// request cannot skip what the form checked.
export const runValidatedAction = async <TSchema extends z.ZodType, TData>(
    schema: TSchema,
    values: unknown,
    fallbackMessage: string,
    run: (payload: z.output<TSchema>) => Promise<ApiResponse<TData>>,
): Promise<ApiResult<TData>> => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? fallbackMessage,
            fieldErrors: toFieldErrors(parsed.error),
        }
    }
    return runAction(fallbackMessage, () => run(parsed.data))
}

// Used as `requireId(id, "expense") ?? runAction(...)`.
export const requireId = (id: string | undefined, label: string): ApiResult<never> | undefined =>
    id ? undefined : { success: false, message: `Invalid ${label} id` }
