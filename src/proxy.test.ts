import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"
import type { UserRole } from "./lib/authUtils"
import { proxy } from "./proxy"

const SECRET = "proxy-test-secret"

vi.mock("@/env", () => ({ getEnv: () => ({ JWT_ACCESS_SECRET: SECRET }) }))
vi.mock("@/lib/refreshSession", () => ({ getNewTokensWithRefreshToken: vi.fn(async () => false) }))

const signedInRequest = (path: string, role: UserRole) => {
    const accessToken = jwt.sign({ userId: "u1", email: "owner@naxified.test", role }, SECRET, { expiresIn: "1h" })
    return new NextRequest(`http://localhost:3000${path}`, { headers: { cookie: `accessToken=${accessToken}` } })
}

const redirectOf = async (path: string, role: UserRole) => {
    const response = await proxy(signedInRequest(path, role))
    return response.headers.get("location")
}

describe("proxy: a signed-in visitor on an auth page", () => {
    it("follows ?redirect= to a page their role may open", async () => {
        expect(await redirectOf("/login?redirect=/platform/plans", "super_admin")).toBe(
            "http://localhost:3000/platform/plans",
        )
        expect(await redirectOf("/login?redirect=%2Fadmin%2Fdashboard%2Fclients%3Fstatus%3Dactive", "sales")).toBe(
            "http://localhost:3000/admin/dashboard/clients?status=active",
        )
    })

    it("goes to the role's home without a redirect", async () => {
        expect(await redirectOf("/login", "super_admin")).toBe("http://localhost:3000/platform")
        expect(await redirectOf("/register", "admin")).toBe("http://localhost:3000/admin/dashboard")
    })

    it.each([
        "//evil.example",
        "https://evil.example",
        "/\\evil.example",
        "/.//evil.example",
        "/%2e//evil.example",
        "/platform/plans@evil.example",
    ])("never leaves the site for ?redirect=%s", async (target) => {
        const location = await redirectOf(`/login?redirect=${encodeURIComponent(target)}`, "super_admin")
        expect(new URL(location ?? "").origin).toBe("http://localhost:3000")
    })

    it("does not follow a redirect into an area the role cannot open", async () => {
        expect(await redirectOf("/login?redirect=/platform/plans", "admin")).toBe("http://localhost:3000/admin/dashboard")
        expect(await redirectOf("/login?redirect=/login", "admin")).toBe("http://localhost:3000/admin/dashboard")
    })
})
