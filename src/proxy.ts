import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
    canRoleReach,
    getAreaRule,
    getDefaultDashboardRoute,
    isAuthRoute,
    type UserRole,
} from "./lib/authUtils";
import { allow } from "./lib/csp";
import { jwtUtils } from "./lib/jwtUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import { getNewTokensWithRefreshToken } from "@/lib/refreshSession";
import { toUserRole } from "./types/user.types";

// Next 16 renamed the `middleware` file convention to `proxy`. Same runtime,
// same matcher config - only the file and export names changed.

async function refreshTokenInProxy(refreshToken: string): Promise<boolean> {
    try {
        return await getNewTokensWithRefreshToken(refreshToken);
    } catch (error) {
        console.error("Error refreshing token in proxy:", error);
        return false;
    }
}

export async function proxy(request: NextRequest) {
    try {
        const { pathname } = request.nextUrl;
        const pathWithQuery = `${pathname}${request.nextUrl.search}`;

        const accessToken = request.cookies.get("accessToken")?.value;
        const refreshToken = request.cookies.get("refreshToken")?.value;

        const verified = accessToken
            ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
            : null;

        const isValidAccessToken = Boolean(verified?.success);
        const userRole: UserRole | null = verified?.success
            ? toUserRole(verified.decoded?.role)
            : null;

        const area = getAreaRule(pathname);
        const isAuth = isAuthRoute(pathname);

        // Rule 0 - proactively refresh a token that is about to expire, so a
        // long session never bounces the user to /login mid-navigation.
        //
        // It does NOT return. It used to, and that was an authorisation
        // bypass: returning here skipped Rules 1 to 5, so for the sixty
        // seconds before a token expired - once per token lifetime, for every
        // signed-in session - canRoleReach never ran and every page was open
        // to every role. Measured with the leeway widened so the window was
        // always open: all 66 routes went to "open" for all four roles,
        // including the platform pages.
        //
        // Refreshing is housekeeping. It is not a decision about who may be
        // here, so it must not be the thing that answers that question.
        const requestHeaders = new Headers(request.headers);
        let refreshed = false;

        if (isValidAccessToken && accessToken && refreshToken && isTokenExpiringSoon(accessToken)) {
            refreshed = await refreshTokenInProxy(refreshToken);

            if (refreshed) {
                // The rotated cookies have to be put into the REQUEST too.
                //
                // refreshTokenInProxy writes them with cookies().set(), which
                // Next flushes onto the RESPONSE's Set-Cookie - it does not
                // touch the request headers this render will read. Without
                // this line the render saw the old, about-to-expire token
                // while x-token-refreshed told httpClient not to refresh
                // either, so a token that expired in flight 401'd the API and
                // bounced the person to /login on the very request that had
                // just renewed their session.
                const store = await cookies();
                requestHeaders.set(
                    "cookie",
                    store
                        .getAll()
                        .map((entry) => `${entry.name}=${entry.value}`)
                        .join("; ")
                );
            }

            // The role on the rotated token is the same role: a refresh
            // renews a session, it does not change who it belongs to. So the
            // userRole read above still holds for the checks below.
        }

        // Rule 1 - a signed-in user has no business on the auth pages.
        if (isAuth && isValidAccessToken && userRole) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
        }

        // Rule 2 - public route, nothing to check.
        if (area === null) {
            return allow(request, requestHeaders, { refreshed });
        }

        // Rule 3 - not signed in on a protected route. Carry the intended
        // destination so login can send them back where they were going.
        if (!isValidAccessToken || !userRole) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathWithQuery);
            return NextResponse.redirect(loginUrl);
        }

        // Rule 4 - signed in, and the area is open to any signed-in user.
        if (area.roles === null) {
            return allow(request, requestHeaders, { refreshed });
        }

        // Rule 5 - role-gated area: send a role that cannot open it to its own
        // home rather than showing a 403 they can do nothing about.
        if (!canRoleReach(pathname, userRole)) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
        }

        return allow(request, requestHeaders, { refreshed });
    } catch (error) {
        console.error("Error in proxy:", error);

        // Fail CLOSED on a protected route.
        //
        // This used to fall through to the page on any error, on the reasoning
        // that a proxy bug should not take the whole site down. But the pages
        // have no auth check of their own - the API is what refuses, and it
        // refuses data, not the shell - so falling through meant an unhandled
        // exception here was the difference between a redirect and a rendered
        // admin layout.
        //
        // A public route still falls through, because failing closed there
        // WOULD take the site down: a bug in this function would put /login
        // itself behind a redirect to /login.
        //
        // Nothing observed produced this path - with JWT_ACCESS_SECRET blanked
        // entirely, verifyToken returns { success: false } rather than
        // throwing, and Rule 3 redirects correctly. That is the point: the
        // catch exists for what has not happened yet, and it should not be the
        // one branch that opens the door.
        try {
            if (getAreaRule(request.nextUrl.pathname) === null) {
                return allow(request);
            }

            const loginUrl = new URL("/login", request.url);
            // The QUERY too, exactly as Rule 3 does it. Signing in from a
            // filtered report should come back to that report, not to a bare
            // one with the filters dropped.
            loginUrl.searchParams.set(
                "redirect",
                `${request.nextUrl.pathname}${request.nextUrl.search}`
            );
            return NextResponse.redirect(loginUrl);
        } catch {
            // The recovery itself failed, so getAreaRule is very likely what
            // threw - which means it would throw for /login too. Redirecting
            // there would be a request for /login that redirects to /login,
            // forever: ERR_TOO_MANY_REDIRECTS on the whole site, which is the
            // outage the outer branch is written to avoid.
            //
            // So fall through instead. The layout still calls getUserInfo and
            // the API still refuses without a session, and a page that renders
            // its shell is a far smaller failure than a site nobody can open.
            return allow(request);
        }
    }
}

export const config = {
    matcher: [
        {
            /*
             * Every path except:
             * - api            (route handlers)
             * - _next/static   (static files)
             * - _next/image    (image optimization)
             * - metadata files
             */
            source: '/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',

            /*
             * And not prefetches. A dashboard full of <Link> fires one per
             * link as it scrolls into view, and each would run this whole
             * function - a UUID, a policy, sometimes a refresh round trip - to
             * attach a nonce to an RSC payload that is not a document and will
             * never use it.
             *
             * Auth is not weakened by skipping them: a prefetch only warms a
             * cache, and the real navigation that follows goes through here.
             */
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
