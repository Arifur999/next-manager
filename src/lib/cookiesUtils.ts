/**
 * Cookie plumbing for server code.
 *
 * NOT "use server", and that is the point. That directive turns every export
 * of a module into a public HTTP endpoint - Next registers an action id and
 * anything that knows it can POST to any route and invoke the function.
 *
 * These three were registered exactly that way, and `getCookie` was the
 * consequence: a call with ["accessToken"] returned the signed-in user's
 * httpOnly token in the RSC payload. Verified against a production build - the
 * value came back byte-identical to the cookie. httpOnly stops script reading
 * the cookie; this handed it over on request, which is the same exfiltration
 * path that taking the tokens out of the login body was meant to close.
 *
 * Nothing imports these from a client component - every caller is server-side
 * - so the directive bought nothing and cost that.
 *
 * getCookie itself is gone. It had no callers at all: it was dead code that
 * happened to be an endpoint.
 */

import { cookies } from "next/headers"

export const setCookie = async (name: string, value: string, maxAgeInSeconds: number) => {
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeInSeconds,
  })
}

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}
