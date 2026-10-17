import { z } from "zod"

/**
 * What checking the token in an emailed link (an invite, a password reset) can
 * come back with. "gone" and "unavailable" are kept apart because they ask
 * different things of the person: a dead link needs a new one, a check that
 * did not go through only needs another try.
 */
export type LinkLookup<TData> =
    | { status: "valid"; data: TData }
    | { status: "gone" }
    | { status: "unavailable" }

// The API answers a dead link (expired, spent, revoked, never real) with 404;
// 410 is accepted too. Anything else that is not a success says nothing about
// the link, so it is never reported as dead.
const DEAD_LINK_STATUSES = new Set([404, 410])

export const classifyLinkLookup = <TData>(
    status: number,
    body: unknown,
    schema: z.ZodType<TData>,
): LinkLookup<TData> => {
    if (DEAD_LINK_STATUSES.has(status)) return { status: "gone" }
    if (status < 200 || status >= 300) return { status: "unavailable" }

    const parsed = z.object({ data: schema }).safeParse(body)
    return parsed.success ? { status: "valid", data: parsed.data.data } : { status: "unavailable" }
}
