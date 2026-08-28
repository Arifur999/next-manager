import { NextRequest, NextResponse } from "next/server";
import {
    canRoleReach,
    getAreaRule,
    getDefaultDashboardRoute,
    isAuthRoute,
    type UserRole,
} from "./lib/authUtils";
import { jwtUtils } from "./lib/jwtUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import { getNewTokensWithRefreshToken } from "./services/auth.services";
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
        if (isValidAccessToken && accessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
            const requestHeaders = new Headers(request.headers);

            const refreshed = await refreshTokenInProxy(refreshToken);

            if (refreshed) {
                // Tells httpClient, further down the same request, that the
                // refresh already happened - otherwise every Server Component
                // would try again against a token that has just been rotated.
                requestHeaders.set("x-token-refreshed", "1");
            }

            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        // Rule 1 - a signed-in user has no business on the auth pages.
        if (isAuth && isValidAccessToken && userRole) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
        }

        // Rule 2 - public route, nothing to check.
        if (area === null) {
            return NextResponse.next();
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
            return NextResponse.next();
        }

        // Rule 5 - role-gated area: send a role that cannot open it to its own
        // home rather than showing a 403 they can do nothing about.
        if (!canRoleReach(pathname, userRole)) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error("Error in proxy:", error);
        // Never let a proxy bug take the whole site down - fall through to the
        // route and let the page's own auth checks answer.
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Every path except:
         * - api            (route handlers)
         * - _next/static   (static files)
         * - _next/image    (image optimization)
         * - metadata files
         */
        '/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
};
