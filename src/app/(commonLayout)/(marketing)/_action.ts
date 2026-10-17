"use server"

import { getEnv } from "@/env"
import { getDefaultDashboardRoute } from "@/lib/authUtils"
import { jwtUtils } from "@/lib/jwtUtils"
import { toUserRole } from "@/types/user.types"
import { cookies } from "next/headers"

/**
 * The signed-in visitor's dashboard, or null. Asked for by the header after
 * the landing page loads, so the page itself never reads cookies and stays a
 * static render. Tells the caller nothing beyond where their own session goes.
 */
export const getDashboardHomeAction = async (): Promise<string | null> => {
    const accessToken = (await cookies()).get("accessToken")?.value
    if (!accessToken) return null

    // Checked the way the proxy checks it; the proxy has already renewed a
    // token that was about to expire on the way to this page.
    const verified = jwtUtils.verifyToken(accessToken, getEnv().JWT_ACCESS_SECRET)
    if (!verified.success) return null

    const role = toUserRole(verified.decoded.role)
    return role ? getDefaultDashboardRoute(role) : null
}
