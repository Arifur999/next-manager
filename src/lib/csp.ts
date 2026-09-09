import { NextRequest, NextResponse } from "next/server"

/**
 * Content-Security-Policy, with a nonce per request.
 *
 * The point of a CSP is that injected script does not run. A policy loose
 * enough to skip nonces - `script-src 'unsafe-inline'` - allows exactly what it
 * is meant to stop, so it is worse than none: it looks configured and is not.
 *
 * Next inlines its own bootstrap script, which is why the nonce has to be
 * minted here, in the proxy, and handed to the render through a request header.
 * Next reads `x-nonce` off the request and stamps it onto every script tag it
 * emits; those scripts then load the rest, which is what `strict-dynamic`
 * exists for. With strict-dynamic present, browsers that understand it IGNORE
 * the host allowlist in script-src and trust only the nonce and what it pulls
 * in - which is the stronger rule, and the reason 'self' stays there only for
 * older browsers.
 *
 * Where it is deliberately not tight:
 *
 *   style-src 'unsafe-inline'  - Next inlines critical CSS and Tailwind emits
 *                                inline style attributes. There is no nonce
 *                                path for these, and injected CSS is a far
 *                                smaller problem than injected script.
 *   img-src https:             - avatar_url is a free-text column, so an avatar
 *                                may legitimately live on someone else's host.
 *                                An image is not executable.
 *
 * connect-src keeps 'self' plus the ws/wss schemes: the chat socket opens
 * against this same origin, and same-origin WebSocket is not covered by 'self'
 * in every browser.
 */
const isProduction = process.env.NODE_ENV === "production"

const policy = (nonce: string) =>
    [
        "default-src 'self'",

        // 'unsafe-eval' in development ONLY, and Next requires it: React uses
        // eval there to rebuild server-side error stacks in the browser, so
        // without it a real server error arrives as an opaque client one with
        // CSP noise beside it. It is never sent in production, which is the
        // only place it would matter.
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProduction ? "" : " 'unsafe-eval'"}`,

        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",

        // 'self' covers the chat socket, which is same-origin: useChatSocket
        // takes NEXT_PUBLIC_API_BASE_URL and only swaps the protocol and path,
        // so it opens wss://<this origin>/ws.
        //
        // The bare ws: and wss: schemes were here before and were a hole: a
        // scheme-source matches ANY host, so injected script could have opened
        // a socket to somebody else's server and streamed the page off it -
        // the exact exfiltration channel default-src 'self' is meant to close.
        // In development the dev server's HMR socket needs the local schemes,
        // and only there.
        `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,

        // Nothing here is meant to be embedded. This is the header version of
        // X-Frame-Options and the one modern browsers actually read.
        "frame-ancestors 'none'",
        "frame-src 'none'",
        "object-src 'none'",

        // Stops injected markup from repointing every relative URL on the page.
        "base-uri 'self'",

        // A form that posts somewhere else is how a page exfiltrates what was
        // typed into it.
        "form-action 'self'",

        // Production only. Browsers exempt localhost, so on a dev machine this
        // is invisible - but `next dev` opened on a LAN address to test on a
        // phone has every subresource rewritten to https, with nothing
        // listening on 443, and the page simply fails to load.
        ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; ")

/**
 * Let the request through, carrying a nonce and the policy that names it.
 *
 * Every path in the proxy that renders a page goes through here, so there is
 * one place the header is set rather than five that have to stay in step.
 */
export const allow = (
    request: NextRequest,
    extraRequestHeaders?: Headers,
    options?: { refreshed?: boolean }
) => {
    const nonce = crypto.randomUUID().replace(/-/g, "")
    const value = policy(nonce)

    const requestHeaders = extraRequestHeaders ?? new Headers(request.headers)

    // x-token-refreshed is a SERVER signal, and it is set here rather than by
    // the caller so it cannot be forged or forgotten.
    //
    // Next's HIDDEN_REQUEST_HEADERS masks only its own flight headers, so a
    // client-sent `x-token-refreshed: 1` reached headers() in the render
    // untouched - and httpClient reads it as "the proxy already refreshed,
    // do not bother". Anyone could have sent it and switched proactive refresh
    // off for their own session, which then simply expires into /login instead
    // of rolling over. Deleted on every path, set on none but this one.
    requestHeaders.delete("x-token-refreshed")
    if (options?.refreshed) {
        requestHeaders.set("x-token-refreshed", "1")
    }

    requestHeaders.set("x-nonce", nonce)
    // Next reads the policy off the REQUEST to decide where to place the nonce,
    // so it has to be set on both halves, not just the response.
    requestHeaders.set("content-security-policy", value)

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set("content-security-policy", value)

    return response
}
